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
  interface IResult<type = string> {
    [key: string]: {
      [key: string]: {
        [key: string]: type;
      };
    };
  }

  interface IQuery {
    name: string;
    chapter_name: string;
    id: number;
    mf_end_date: Date;
    month: number;
    year: number;
    total_due_amount: number;
    weekly_meeting_fees: number;
    meeting_day: string;
    member_id: string;
    members_count: number;
    total_meeting_day: number;
  }

  const { method, query } = req;

  if (method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  await checkUserAuth(req, res, next);

  const { page = "1", pageSize = "10", chapterId } = query;
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
  group_concat(distinct m.id) AS member_id,concat(m.first_name, " ", m.last_name) as name,
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
    ) and c.id=${chapterId}
GROUP BY m.id;
  `;

    // Execute the query
    const [rows]: [IQuery[]] = await conn.query(query, [
      parsedPageSize,
      (parsedPage - 1) * parsedPageSize,
    ]);
    // const totalItems = rows.length > 0 ? rows[0]?.totalItems : 0;
    // const totalPages = Math.ceil(totalItems / parsedPageSize);

    let userWiseData: IResult<number> = {
      previous: {},
      current: {},
    };

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
      // newwork
      rows.map((itm: any) => {
        
        userWiseData["previous"][`${itm.name}#@${itm?.member_id}`] = {};
        userWiseData["current"][`${itm.name}#@${itm?.member_id}`] = {};
        
      });

      // newwork
      Object.keys(userWiseData["previous"]).map((ele) => {
        for (let i = 1; i <= 12; i++) {
          if (
            (currentMonth <= 3 && i >= 4 && i <= 9) ||
            (currentMonth >= 4 && (i >= 10 || i <= 3))
          ) {
            userWiseData["previous"][ele][
              `${numberToMonthMap[i]}-${
                currentMonth <= 3 && i >= 4 && i <= 9
                  ? currentYear - 1
                  : currentMonth >= 4 && i >= 10
                  ? currentYear - 1
                  : currentYear
              }`
            ] = 0;
          } else {

            userWiseData["current"][ele][
              `${numberToMonthMap[i]}-${
                i >= 10 && i <= 12 ? currentYear - 1 : currentYear
              }`
            ] = 0;

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


        // newwork
        userWiseData = sortMonthYearKeys(userWiseData);

        const fillOtherMonthData = (rowObj: IQuery, rowMemberIdObj: IResult<number>, yearType: string, month: number, year: number, monthYear: string, isMonthYearFound=false) => {
          Object.keys(rowMemberIdObj[yearType][`${rowObj.name}#@${rowObj?.member_id}`] || {}).map(monthYearStr => {
            const currentMonthStr = monthYearStr.split("-");
                const currentYear = parseInt(currentMonthStr[1] || "0");
                const currentMonth = monthOrder[currentMonthStr[0] || "Jan"];
    
                if (monthYear == monthYearStr){
                  isMonthYearFound=true
                }else if (isMonthYearFound){
                  const totalMeetingDay = getWeekDayInMonth(
                    currentYear,
                    currentMonth - 1,
                    getWeekdayNumber(rowObj.meeting_day || "sunday")
                  );
    
                  rowMemberIdObj[yearType][`${rowObj.name}#@${rowObj?.member_id}`][monthYearStr] = (totalMeetingDay || 0)*(rowObj?.weekly_meeting_fees || 0)
                }
          })

          if (yearType == "previous"){
            fillOtherMonthData(rowObj, rowMemberIdObj, "current", month, year, monthYear, true)
          }

          // console.log(rowMemberIdObj,"*************rowMemberIdObjggg")
        }
        rows.map((row: IQuery) => {
          if (
            Object.keys(userWiseData.previous[`${row.name}#@${row?.member_id}`] || {}).length < 6 ||
            (Object.keys(userWiseData.previous[`${row.name}#@${row?.member_id}`] || {}).length == 6 &&
              userWiseData.previous[`${row.name}#@${row?.member_id}`]?.[
                `${numberToMonthMap[row.month]}-${row.year}`
              ] !== undefined)
          ){
            userWiseData["previous"][`${row.name}#@${row?.member_id}`] = userWiseData["previous"][
              `${row.name}#@${row?.member_id}`
            ] 
              ? {
                ...userWiseData["previous"][`${row.name}#@${row?.member_id}`],
                [`${numberToMonthMap[row.month]}-${row.year}`]: row.total_due_amount || 0
              }
              : {
                [`${numberToMonthMap[row.month]}-${row.year}`]:
                  row.total_due_amount || 0,
              };
    
              fillOtherMonthData(row, userWiseData, "previous", row.month, row.year, `${numberToMonthMap[row.month]}-${row.year}`)
          }else{
            userWiseData["current"][`${row.name}#@${row?.member_id}`] = userWiseData["current"][
              `${row.name}#@${row?.member_id}`
            ] 
              ? {
                ...userWiseData["current"][`${row.name}#@${row?.member_id}`],
                [`${numberToMonthMap[row.month]}-${row.year}`]: row.total_due_amount || 0
              }
              : {
                [`${numberToMonthMap[row.month]}-${row.year}`]:
                  row.total_due_amount || 0,
              };
    
              fillOtherMonthData(row, userWiseData, "current", row.month, row.year, `${numberToMonthMap[row.month]}-${row.year}`)
          }
        })

    // Prepare response data
    const data = userWiseData;

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
