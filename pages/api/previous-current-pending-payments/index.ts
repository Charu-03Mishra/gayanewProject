import { NextApiRequest, NextApiResponse } from "next";
import { connect } from "../../../utils/db";
import checkUserAuth from "../auth";

const handleError = (
  res: NextApiResponse,
  statusCode: number,
  message: string
) => {
  res.status(statusCode).json({ error: message });
};

export default async function handler(
  req: any,
  res: NextApiResponse,
  next: Function
) {
  interface IResult<type=string> {
    [key: string]: {
      [key: string]: {
        [key: string]: type;
      };
    };
  }

  interface IQuery {
    chapter_name: string;
    id: number;
    mf_end_date: Date;
    month: number;
    year: number;
    total_due_amount: number;
    weekly_meeting_fees: number;
    member_id: string;
    members_count: number;
    total_meeting_day: number
  }

  const { method, query } = req;

  if (method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  await checkUserAuth(req, res, next);

  const { page = "1", pageSize = "10" } = query;
  const parsedPage = parseInt(page as string, 10) || 1;
  const parsedPageSize = parseInt(pageSize as string, 10) || 10;

  try {
    const conn = await connect();
    let whereClauses = [];
    let queryParams: any[] = [];

    // Add user permission filtering
    if (req.user[0][0].permission_SGDC) {
      whereClauses.push("m.chapter_id IN (?)");
      const [sgdcRows] = await conn.query(
        `SELECT chapter_id FROM sgdc WHERE id = ?`,
        [req.user[0][0].permission_SGDC]
      );
      queryParams.push(JSON.parse(sgdcRows[0].chapter_id));
    } else if (req.user[0][0].permission_LT) {
      whereClauses.push("m.chapter_id = ?");
      const [ltRows] = await conn.query(
        `SELECT chapter_id FROM leadership WHERE id = ?`,
        [req.user[0][0].permission_LT]
      );
      queryParams.push(ltRows[0].chapter_id);
    }

    // Where clause string
    const whereClause =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // const query = `select c.chapter_name, month(members.mf_end_date) as month, year(members.mf_end_date) as year,
    //     SUM(CEIL(datediff(LAST_DAY(members.mf_end_date), members.mf_end_date) / 7) * 944) as total_due_amount
    //     from members
    //     left join chapters c on c.id = members.chapter_id
    //     where (
    //     (MONTH(CURDATE()) <= 3 AND YEAR(members.mf_end_date) = YEAR(CURDATE()) - 1 AND MONTH(members.mf_end_date) >= 4)
    //     or
    //     (MONTH(CURDATE()) <= 3 AND YEAR(members.mf_end_date) = YEAR(CURDATE()) AND MONTH(members.mf_end_date) <= 3)
    //     or
    //     (MONTH(CURDATE()) >= 4 AND YEAR(members.mf_end_date) = YEAR(CURDATE()) - 1 AND MONTH(members.mf_end_date) >= 10)
    //     or
    //     (MONTH(CURDATE()) >= 4 AND YEAR(members.mf_end_date) = YEAR(CURDATE()) AND MONTH(members.mf_end_date) <= 9)
    //     ) and members.mf_end_date is not null
    //     group by year(members.mf_end_date), month(members.mf_end_date), members.chapter_id;`;

    const query = `
    SELECT
c.chapter_name, c.id,m.mf_end_date, month(m.mf_end_date) as month, year(m.mf_end_date) as year,
  (count(distinct m.id) * count(distinct
  CASE 
    WHEN DATE(CONCAT(YEAR(m.mf_end_date), '-', MONTH(m.mf_end_date), '-', LPAD(numbers.n, 2, '0'))) > DATE(m.mf_end_date)
    THEN DATE(CONCAT(YEAR(m.mf_end_date), '-', MONTH(m.mf_end_date), '-', LPAD(numbers.n, 2, '0')))
    ELSE NULL
  END) * c.weekly_meeting_fees) as total_due_amount,c.weekly_meeting_fees,
  group_concat(distinct m.id) AS member_id,
count(distinct m.id) as members_count,
 c.meeting_day ,count(distinct
  CASE 
    WHEN DATE(CONCAT(YEAR(m.mf_end_date), '-', MONTH(m.mf_end_date), '-', LPAD(numbers.n, 2, '0'))) > DATE(m.mf_end_date)
    THEN DATE(CONCAT(YEAR(m.mf_end_date), '-', MONTH(m.mf_end_date), '-', LPAD(numbers.n, 2, '0')))
    ELSE NULL
  END) as payment_left_count,
  count(distinct
    CONCAT(YEAR(m.mf_end_date), '-', MONTH(m.mf_end_date), '-', LPAD(numbers.n, 2, '0'))) as total_meeting_day
FROM 
  members AS m
left JOIN (
  SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5
  UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10
  UNION ALL SELECT 11 UNION ALL SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15
  UNION ALL SELECT 16 UNION ALL SELECT 17 UNION ALL SELECT 18 UNION ALL SELECT 19 UNION ALL SELECT 20
  UNION ALL SELECT 21 UNION ALL SELECT 22 UNION ALL SELECT 23 UNION ALL SELECT 24 UNION ALL SELECT 25
  UNION ALL SELECT 26 UNION ALL SELECT 27 UNION ALL SELECT 28 UNION ALL SELECT 29 UNION ALL SELECT 30
  UNION ALL SELECT 31
) AS numbers ON TRUE
join chapters c on c.id = m.chapter_id
WHERE 
m.membership_status = 'Active' and
  DAYOFWEEK(DATE(CONCAT(YEAR(m.mf_end_date), '-', MONTH(m.mf_end_date), '-', LPAD(numbers.n, 2, '0')))) = (
    SELECT 
      CASE c.meeting_day
        WHEN 'sunday' THEN 1
        WHEN 'monday' THEN 2
        WHEN 'tuesday' THEN 3
        WHEN 'wednesday' THEN 4
        WHEN 'thursday' THEN 5
        WHEN 'friday' THEN 6
        WHEN 'saturday' THEN 7
      END
  ) and
  m.mf_end_date is not null and
  (
        (MONTH(CURDATE()) <= 3 AND YEAR(m.mf_end_date) = YEAR(CURDATE()) - 1 AND MONTH(m.mf_end_date) >= 4)
        or
        (MONTH(CURDATE()) <= 3 AND YEAR(m.mf_end_date) = YEAR(CURDATE()) AND MONTH(m.mf_end_date) <= 3)
        or
        (MONTH(CURDATE()) >= 4 AND YEAR(m.mf_end_date) = YEAR(CURDATE()) - 1 AND MONTH(m.mf_end_date) >= 10)
        or
        (MONTH(CURDATE()) >= 4 AND YEAR(m.mf_end_date) = YEAR(CURDATE()) AND MONTH(m.mf_end_date) <= 8)
    )
GROUP BY 
  DATE(m.mf_end_date),
  m.chapter_id
  order by chapter_name;
  `;

    // Execute the query
    const [rows]: [IQuery[]] = await conn.query(query, [
      parsedPageSize,
      (parsedPage - 1) * parsedPageSize,
    ]);
    // const totalItems = rows.length > 0 ? rows[0].totalItems : 0;
    // const totalPages = Math.ceil(totalItems / parsedPageSize);

    let result: IResult = {
      previous: {},
      current: {},
    };

    let endedMembershipUserCount: any = {
      previous: {},
      current: {},
    };

    let monthlyFeesAndTotalMeetingDays: IResult<{
        weekly_meeting_fees: number,
        total_meeting_day: number,
    }> = {
      previous: {},
      current: {},
    };

    let chapterMeetingDay: {
      [key: string]: number
    } = {};

    const numberToMonthMap: {
      [key: number]: string;
    } = {
      1: "Jan",
      2: "Feb",
      3: "Mar",
      4: "Apr",
      5: "May",
      6: "Jun",
      7: "Jul",
      8: "Aug",
      9: "Sep",
      10: "Oct",
      11: "Nov",
      12: "Dec",
    };

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const getWeekdayNumber = (day: string) => {
      const days = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];
      return days.indexOf(day.toLowerCase());
    };

    const fillRelevantMonths = () => {
      rows.map((itm: any) => {
        result["previous"][`${itm.id}#${itm.chapter_name}`] = {};
        result["current"][`${itm.id}#${itm.chapter_name}`] = {};

        endedMembershipUserCount["previous"][`${itm.id}#${itm.chapter_name}`] = {};
        endedMembershipUserCount["current"][`${itm.id}#${itm.chapter_name}`] = {};

        monthlyFeesAndTotalMeetingDays["previous"][`${itm.id}#${itm.chapter_name}`] = {};
        monthlyFeesAndTotalMeetingDays["current"][`${itm.id}#${itm.chapter_name}`] = {};

        chapterMeetingDay[`${itm.id}#${itm.chapter_name}`] = 0;
      });

      Object.keys(result["previous"]).map((ele) => {
        for (let i = 1; i <= 12; i++) {
          if (
            (currentMonth <= 3 && i >= 4 && i <= 9) ||
            (currentMonth >= 4 && (i >= 10 || i <= 3))
          ) {
            result["previous"][ele][
              `${numberToMonthMap[i]}-${
                currentMonth <= 3 && i >= 4 && i <= 9
                  ? currentYear - 1
                  : currentMonth >= 4 && i >= 10
                  ? currentYear - 1
                  : currentYear
              }`
            ] = "0";

            endedMembershipUserCount["previous"][ele][
              `${numberToMonthMap[i]}-${
                currentMonth <= 3 && i >= 4 && i <= 9
                  ? currentYear - 1
                  : currentMonth >= 4 && i >= 10
                  ? currentYear - 1
                  : currentYear
              }`
            ] = 0;

            chapterMeetingDay[ele] = getWeekdayNumber("sunday");

            monthlyFeesAndTotalMeetingDays["previous"][ele][
              `${numberToMonthMap[i]}-${
                currentMonth <= 3 && i >= 4 && i <= 9
                  ? currentYear - 1
                  : currentMonth >= 4 && i >= 10
                  ? currentYear - 1
                  : currentYear
              }`
            ] = {
              weekly_meeting_fees: 0,
              total_meeting_day: 0,
            };
          } else {
            result["current"][ele][
              `${numberToMonthMap[i]}-${
                i >= 10 && i <= 12 ? currentYear - 1 : currentYear
              }`
            ] = "0";

            endedMembershipUserCount["current"][ele][
              `${numberToMonthMap[i]}-${
                i >= 10 && i <= 12 ? currentYear - 1 : currentYear
              }`
            ] = 0;

            chapterMeetingDay[ele] = getWeekdayNumber("sunday");

            monthlyFeesAndTotalMeetingDays["current"][ele][
              `${numberToMonthMap[i]}-${
                i >= 10 && i <= 12 ? currentYear - 1 : currentYear
              }`
            ] = {
              weekly_meeting_fees: 0,
              total_meeting_day: 0,
            };
          }
        }
      });
    };
    fillRelevantMonths();

    const monthOrder: { [key: string]: number } = {
      Jan: 1,
      Feb: 2,
      Mar: 3,
      Apr: 4,
      May: 5,
      Jun: 6,
      Jul: 7,
      Aug: 8,
      Sep: 9,
      Oct: 10,
      Nov: 11,
      Dec: 12,
    };
    const sortMonthYearKeys = (obj: any) => {
      const parseMonthYear = (key: string) => {
        const [month, year] = key.split("-");
        return { year: parseInt(year, 10), month: monthOrder[month] };
      };

      const sortKeys = (objSection: any) => {
        for (const key in objSection) {
          const innerObj = objSection[key];
          const sortedKeys = Object.keys(innerObj).sort((a, b) => {
            const { year: yearA, month: monthA } = parseMonthYear(a);
            const { year: yearB, month: monthB } = parseMonthYear(b);
            if (yearA === yearB) {
              return monthA - monthB;
            }
            return yearA - yearB;
          });

          // Reorder the keys in the object
          objSection[key] = Object.fromEntries(
            sortedKeys.map((sortedKey) => [sortedKey, innerObj[sortedKey]])
          );
        }
      };

      if (obj.previous) {
        sortKeys(obj.previous);
      }
      if (obj.current) {
        sortKeys(obj.current);
      }

      return obj;
    };

    // Adding members to the month that does not have any data in db (just copying previous month members to it)
    const fillMembersForUnavailableMonths = async (
      endedMembershipUserCount: any,
      yearType: string
    ) => {

      for (const yearKey of Object.keys(
        endedMembershipUserCount[yearType] || {}
      )) {
        const yearKeys = Object.keys(
          endedMembershipUserCount[yearType][yearKey] || {}
        );
        for (let i = 0; i < yearKeys.length; i++) {
          const monthYearStr = yearKeys[i];
          const splitMonthYearStr = monthYearStr.split("-");
          const year = parseInt(splitMonthYearStr[1] || "0");
          const month = monthOrder[splitMonthYearStr[0] || "Jan"];

          let date = new Date();

          // Set the year and month
          date.setFullYear(year); // Set year to 2025
          date.setMonth(month - 1); // jan -> 0
          date.setMonth(month - 2); // for previous month
          const prevMonthYearStr = `${
            numberToMonthMap[date.getMonth() + 1]
          }-${date.getFullYear()}`;

          let currentKey =
            endedMembershipUserCount[yearType][yearKey][monthYearStr];
          let prevKey =
            endedMembershipUserCount[yearType][yearKey][prevMonthYearStr];

          if (yearType == "current" && prevKey == undefined) {
            if (month == 4 || month == 10) {
              prevKey =
                endedMembershipUserCount["previous"][yearKey][prevMonthYearStr];
            }
          }

          if (!currentKey && prevKey) {
            endedMembershipUserCount[yearType][yearKey][monthYearStr] = prevKey;
          }
  
        }
      }
    };
    result = sortMonthYearKeys(result);

    const getTotalMembersTillAMonth = (
      endedMembershipUserCount: IResult<any>,
      prevRow: any,
      row: any,
      yearType: string
    ) => {
      if (yearType == "previous") {
        if (endedMembershipUserCount["previous"][`${row.id}#${row.chapter_name}`]) {
          if (row.month == 4 || row.month == 10) {
            endedMembershipUserCount["previous"][`${row.id}#${row.chapter_name}`] = {
              ...endedMembershipUserCount["previous"][`${row.id}#${row.chapter_name}`],
              [`${numberToMonthMap[row.month]}-${row.year}`]:
                endedMembershipUserCount["previous"][`${row.id}#${row.chapter_name}`][
                  `${numberToMonthMap[row.month]}-${row.year}`
                ]
                  ? parseInt(
                      endedMembershipUserCount["previous"][`${row.id}#${row.chapter_name}`][
                        `${numberToMonthMap[row.month]}-${row.year}`
                      ] || "0"
                    ) + parseInt(row.members_count || "0")
                  : row.members_count,
            };
          } else {
            endedMembershipUserCount["previous"][`${row.id}#${row.chapter_name}`] = {
              ...endedMembershipUserCount["previous"][`${row.id}#${row.chapter_name}`],
              [`${numberToMonthMap[row.month]}-${row.year}`]:
                endedMembershipUserCount["previous"][`${row.id}#${row.chapter_name}`][
                  `${numberToMonthMap[row.month]}-${row.year}`
                ]
                  ? parseInt(
                      endedMembershipUserCount["previous"][`${row.id}#${row.chapter_name}`][
                        `${numberToMonthMap[row.month]}-${row.year}`
                      ] || "0"
                    ) + parseInt(row.members_count || "0")
                  : parseInt(
                      endedMembershipUserCount["previous"][`${row.id}#${row.chapter_name}`][
                        `${numberToMonthMap[prevRow?.month]}-${prevRow?.year}`
                      ] || "0"
                    ) + parseInt(row.members_count || "0"),
            };
          }
        } else {
          if (row.month == 4 || row.month == 10) {
            endedMembershipUserCount["previous"][`${row.id}#${row.chapter_name}`] = {
              [`${numberToMonthMap[row.month]}-${row.year}`]: row.members_count,
            };
          } else {
            endedMembershipUserCount["previous"][`${row.id}#${row.chapter_name}`] = {
              [`${numberToMonthMap[row.month]}-${row.year}`]:
                parseInt(
                  endedMembershipUserCount["previous"][`${row.id}#${row.chapter_name}`][
                    `${numberToMonthMap[prevRow?.month]}-${prevRow?.year}`
                  ] || "0"
                ) + parseInt(row.members_count || "0"),
            };
          }
        }
      } else {
        if (endedMembershipUserCount["current"][`${row.id}#${row.chapter_name}`]) {
          if (row.month == 4 || row.month == 10) {
            endedMembershipUserCount["current"][`${row.id}#${row.chapter_name}`] = {
              ...endedMembershipUserCount["current"][`${row.id}#${row.chapter_name}`],
              [`${numberToMonthMap[row.month]}-${row.year}`]:
                endedMembershipUserCount["current"][`${row.id}#${row.chapter_name}`][
                  `${numberToMonthMap[row.month]}-${row.year}`
                ]
                  ? parseInt(
                      endedMembershipUserCount["current"][`${row.id}#${row.chapter_name}`][
                        `${numberToMonthMap[row.month]}-${row.year}`
                      ] || "0"
                    ) + parseInt(row.members_count || "0")
                  : parseInt(
                      endedMembershipUserCount["previous"][`${row.id}#${row.chapter_name}`][
                        `${numberToMonthMap[prevRow?.month]}-${prevRow?.year}`
                      ] || "0"
                    ) + parseInt(row.members_count || "0"),
            };
          } else {
            endedMembershipUserCount["current"][`${row.id}#${row.chapter_name}`] = {
              ...endedMembershipUserCount["current"][`${row.id}#${row.chapter_name}`],
              [`${numberToMonthMap[row.month]}-${row.year}`]:
                endedMembershipUserCount["current"][`${row.id}#${row.chapter_name}`][
                  `${numberToMonthMap[row.month]}-${row.year}`
                ]
                  ? parseInt(
                      endedMembershipUserCount["current"][`${row.id}#${row.chapter_name}`][
                        `${numberToMonthMap[row.month]}-${row.year}`
                      ] || "0"
                    ) + parseInt(row.members_count || "0")
                  : (prevRow?.month < 4 || prevRow?.month < 10) &&
                    endedMembershipUserCount["previous"][`${row.id}#${row.chapter_name}`][
                      `${numberToMonthMap[prevRow?.month]}-${prevRow?.year}`
                    ] !== undefined
                  ? parseInt(
                      endedMembershipUserCount["previous"][`${row.id}#${row.chapter_name}`][
                        `${numberToMonthMap[prevRow?.month]}-${prevRow?.year}`
                      ] || "0"
                    ) + parseInt(row.members_count || "0")
                  : parseInt(
                      endedMembershipUserCount["current"][`${row.id}#${row.chapter_name}`][
                        `${numberToMonthMap[prevRow?.month]}-${prevRow?.year}`
                      ] || "0"
                    ) + parseInt(row.members_count || "0"),
            };
          }
        } else {
          if (row.month == 4 || row.month == 10) {
            endedMembershipUserCount["current"][`${row.id}#${row.chapter_name}`] = {
              [`${numberToMonthMap[row.month]}-${row.year}`]: row.members_count,
            };
          } else {
            endedMembershipUserCount["current"][`${row.id}#${row.chapter_name}`] = {
              [`${numberToMonthMap[row.month]}-${row.year}`]:
                parseInt(
                  endedMembershipUserCount["current"][`${row.id}#${row.chapter_name}`][
                    `${numberToMonthMap[prevRow?.month]}-${prevRow?.year}`
                  ] || "0"
                ) + parseInt(row.members_count || "0"),
            };
          }
        }
      }
    };

    // Adding total due amount month wise.
    rows.map((row: any, idx: number) => {
      if (
        Object.keys(result.previous[`${row.id}#${row.chapter_name}`] || {}).length < 6 ||
        (Object.keys(result.previous[`${row.id}#${row.chapter_name}`] || {}).length == 6 &&
          result.previous[`${row.id}#${row.chapter_name}`]?.[
            `${numberToMonthMap[row.month]}-${row.year}`
          ] !== undefined)
      ) {
        result["previous"][`${row.id}#${row.chapter_name}`] = result["previous"][
          `${row.id}#${row.chapter_name}`
        ]
          ? {
              ...result["previous"][`${row.id}#${row.chapter_name}`],
              [`${numberToMonthMap[row.month]}-${row.year}`]: result[
                "previous"
              ][`${row.id}#${row.chapter_name}`][`${numberToMonthMap[row.month]}-${row.year}`]
                ? parseInt(
                    result["previous"][`${row.id}#${row.chapter_name}`][
                      `${numberToMonthMap[row.month]}-${row.year}`
                    ] || "0"
                  ) + parseInt(row.total_due_amount || "0")
                : row.total_due_amount,
            }
          : {
              [`${numberToMonthMap[row.month]}-${row.year}`]:
                row.total_due_amount,
            };

        getTotalMembersTillAMonth(
          endedMembershipUserCount,
          rows[idx - 1],
          row,
          "previous"
        );
      } else {
        result["current"][`${row.id}#${row.chapter_name}`] = result["current"][
          `${row.id}#${row.chapter_name}`
        ]
          ? {
              ...result["current"][`${row.id}#${row.chapter_name}`],
              [`${numberToMonthMap[row.month]}-${row.year}`]: result["current"][
                `${row.id}#${row.chapter_name}`
              ][`${numberToMonthMap[row.month]}-${row.year}`]
                ? parseInt(
                    result["current"][`${row.id}#${row.chapter_name}`][
                      `${numberToMonthMap[row.month]}-${row.year}`
                    ] || "0"
                  ) + parseInt(row.total_due_amount || "0")
                : row.total_due_amount,
            }
          : {
              [`${numberToMonthMap[row.month]}-${row.year}`]:
                row.total_due_amount,
            };

        getTotalMembersTillAMonth(
          endedMembershipUserCount,
          rows[idx - 1],
          row,
          "current"
        );
      }
    });

    endedMembershipUserCount = sortMonthYearKeys(endedMembershipUserCount);

    fillMembersForUnavailableMonths(endedMembershipUserCount, "previous");
    fillMembersForUnavailableMonths(endedMembershipUserCount, "current");


    // Removing members of current month to get total members that are added from previous months
    rows.map((row: any) => {
      chapterMeetingDay[`${row.id}#${row.chapter_name}`] = getWeekdayNumber(row.meeting_day);

      if (
        endedMembershipUserCount["previous"][`${row.id}#${row.chapter_name}`][
          `${numberToMonthMap[row.month]}-${row.year}`
        ] !== undefined
      ) {
        endedMembershipUserCount["previous"][`${row.id}#${row.chapter_name}`] = {
          ...endedMembershipUserCount["previous"][`${row.id}#${row.chapter_name}`],
          [`${numberToMonthMap[row.month]}-${row.year}`]: Math.abs(
            parseInt(
              endedMembershipUserCount["previous"][`${row.id}#${row.chapter_name}`][
                `${numberToMonthMap[row.month]}-${row.year}`
              ] || "0"
            ) - row.members_count
          ),
        };

        monthlyFeesAndTotalMeetingDays["previous"][`${row.id}#${row.chapter_name}`] = {
          ...monthlyFeesAndTotalMeetingDays["previous"][`${row.id}#${row.chapter_name}`],
          [`${numberToMonthMap[row.month]}-${row.year}`]: {
            weekly_meeting_fees: row.weekly_meeting_fees || 0,
            total_meeting_day: row.total_meeting_day || 0,
          },
        };
      } else if (
        endedMembershipUserCount["current"][`${row.id}#${row.chapter_name}`][
          `${numberToMonthMap[row.month]}-${row.year}`
        ] !== undefined
      ) {
        endedMembershipUserCount["current"][`${row.id}#${row.chapter_name}`] = {
          ...endedMembershipUserCount["current"][`${row.id}#${row.chapter_name}`],
          [`${numberToMonthMap[row.month]}-${row.year}`]: Math.abs(
            parseInt(
              endedMembershipUserCount["current"][`${row.id}#${row.chapter_name}`][
                `${numberToMonthMap[row.month]}-${row.year}`
              ] || "0"
            ) - row.members_count
          ),
        };

        monthlyFeesAndTotalMeetingDays["current"][`${row.id}#${row.chapter_name}`] = {
          ...monthlyFeesAndTotalMeetingDays["current"][`${row.id}#${row.chapter_name}`],
          [`${numberToMonthMap[row.month]}-${row.year}`]: {
            weekly_meeting_fees: row.weekly_meeting_fees || 0,
            total_meeting_day: row.total_meeting_day || 0,
          },
        };
      }
    });

    const getWeekDayInMonth = (
      year: number,
      month: number,
      dayNumber: number
    ) => {
      const weekDay = [];
      const date = new Date(year, month, 1);

      // Loop through the days of the month
      while (date.getMonth() === month) {
        if (date.getDay() === dayNumber) {
          weekDay.push(new Date(date)); 
        }
        date.setDate(date.getDate() + 1); // Move to the next day
      }

      // console.log(weekDay, "*************weekDay")
      return weekDay.length;
    };

    Object.keys(result["previous"]).map((itm: string) => {
      Object.keys(result["previous"][itm]).map(
        (monthYearStr: string, idx: number) => {
          const prevMonthYearStr = Object.keys(result["previous"][itm])[
            idx - 1
          ];
          let totalMeetingDaysXweeklyMeetingFees =
            (monthlyFeesAndTotalMeetingDays["previous"][itm][monthYearStr]
              .weekly_meeting_fees || 0) *
            (monthlyFeesAndTotalMeetingDays["previous"][itm][monthYearStr]
              .total_meeting_day || 0);

          if (!totalMeetingDaysXweeklyMeetingFees && prevMonthYearStr) {
            const splitMonthYearStr = prevMonthYearStr.split("-");
            const year = parseInt(splitMonthYearStr[1] || "0");
            const month = monthOrder[splitMonthYearStr[0] || "Jan"];

            const currentMonthStr = monthYearStr.split("-");
            const currentYear = parseInt(currentMonthStr[1] || "0");
            const currentMonth = monthOrder[currentMonthStr[0] || "Jan"];

            const totalMeetingDay = getWeekDayInMonth(
              currentYear,
              currentMonth - 1,
              chapterMeetingDay[itm]
            );
            totalMeetingDaysXweeklyMeetingFees =
              (monthlyFeesAndTotalMeetingDays["previous"][itm][prevMonthYearStr]
                .weekly_meeting_fees || 0) * (totalMeetingDay || 0);

            // console.log(monthlyFeesAndTotalMeetingDays["previous"][itm], "*****uuuu")
            monthlyFeesAndTotalMeetingDays["previous"][itm][monthYearStr][
              "weekly_meeting_fees"
            ] =
              monthlyFeesAndTotalMeetingDays["previous"][itm][
                prevMonthYearStr
              ].weekly_meeting_fees;
          }

          const prevUserCount = parseInt(
            endedMembershipUserCount["previous"][itm][monthYearStr] || "0"
          );
          result["previous"][itm][monthYearStr] =
            (parseInt(result["previous"][itm][monthYearStr]) +
            prevUserCount * totalMeetingDaysXweeklyMeetingFees) as unknown as string;
        }
      );
    });

    Object.keys(result["current"]).map((itm: any) => {
      Object.keys(result["current"][itm]).map(
        (monthYearStr: string, idx: number) => {
          const prevResult = Object.keys(result["previous"][itm]);
          const prevMonthYearStr =
            idx == 0
              ? prevResult[prevResult.length - 1]
              : Object.keys(result["current"][itm])[idx - 1];

          const currentMonthStr = monthYearStr.split("-");
          const currentYear = parseInt(currentMonthStr[1] || "0");
          const currentMonth = monthOrder[currentMonthStr[0] || "Jan"];

          let totalMeetingDaysXweeklyMeetingFees =
            (monthlyFeesAndTotalMeetingDays["current"][itm][monthYearStr]
              .weekly_meeting_fees || 0) *
            (monthlyFeesAndTotalMeetingDays["current"][itm][monthYearStr]
              .total_meeting_day || 0);

          if (!totalMeetingDaysXweeklyMeetingFees && prevMonthYearStr) {
            const splitMonthYearStr = prevMonthYearStr.split("-");
            const year = parseInt(splitMonthYearStr[1] || "0");
            const month = monthOrder[splitMonthYearStr[0] || "Jan"];
            const totalMeetingDay = getWeekDayInMonth(
              currentYear,
              currentMonth - 1,
              chapterMeetingDay[itm]
            );
            // console.log(totalMeetingDay, itm,splitMonthYearStr, "***************yhuyyyy")

            totalMeetingDaysXweeklyMeetingFees =
              idx == 0
                ? (monthlyFeesAndTotalMeetingDays["previous"][itm][
                    prevMonthYearStr
                  ]?.weekly_meeting_fees || 0) * (totalMeetingDay || 0)
                : (monthlyFeesAndTotalMeetingDays["current"][itm][
                    prevMonthYearStr
                  ]?.weekly_meeting_fees || 0) * (totalMeetingDay || 0);

            monthlyFeesAndTotalMeetingDays["current"][itm][monthYearStr][
              "total_meeting_day"
            ] = totalMeetingDay || 0;

            // console.log(monthlyFeesAndTotalMeetingDays["current"][itm], "*****uuuu")
            monthlyFeesAndTotalMeetingDays["current"][itm][monthYearStr][
              "weekly_meeting_fees"
            ] =
              (month < 4 || month < 10) &&
              monthlyFeesAndTotalMeetingDays["previous"][itm][
                prevMonthYearStr
              ] !== undefined
                ? monthlyFeesAndTotalMeetingDays["previous"][itm][
                    prevMonthYearStr
                  ]?.weekly_meeting_fees || 0
                : monthlyFeesAndTotalMeetingDays["current"][itm][
                    prevMonthYearStr
                  ]?.weekly_meeting_fees || 0;
          }

          const prevUserCount = parseInt(
            endedMembershipUserCount["current"][itm][monthYearStr] || "0"
          );
          result["current"][itm][monthYearStr] =
            (parseInt(result["current"][itm][monthYearStr]) +
            prevUserCount * totalMeetingDaysXweeklyMeetingFees) as unknown as string;
        }
      );
    });
    // Prepare response data
    const data = result;

    res.status(200).json({
      data,
      pagination: {
        currentPage: parsedPage,
        // totalPages,
        // totalItems,
        pageSize: parsedPageSize,
      },
    });
  } catch (error) {
    console.error("Error fetching payment data:", error);
    handleError(res, 500, "Server Error");
  }
}
