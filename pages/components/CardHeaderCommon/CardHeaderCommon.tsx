import React, { Fragment } from "react";
import { CardHeader } from "reactstrap";
import P from "../Paragraph";
import H4 from "../headings/H4Element";

const CardHeaderCommon: any = ({ title, span, headClass, icon, tagClass }: any) => {
  return (
    <CardHeader className={headClass ? headClass : ""}>
      <H4 className={tagClass ? tagClass : ""}>{icon && icon}{title}</H4>
      {span && (
        <P className="f-m-light mt-1">
          {span.map((data: any, index: any) => (
            <Fragment key={index}>
              {data?.text} {data.code && <code>{data.code}</code>} {data.mark && <mark>{data.mark}</mark>}
            </Fragment>
          ))}
        </P>
      )}
    </CardHeader>
  );
};

export default CardHeaderCommon;