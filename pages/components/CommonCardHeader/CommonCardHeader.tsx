import {CardHeader} from "reactstrap";
import H4 from "../headings/H4Element";
const CommonCardHeader = ({
  headClass,
  title,
  titleClass,
  subClass
}: any) => {
  return (
    <CardHeader className={headClass}>
      <div className={`header-top ${subClass}`}>
        <H4 className={titleClass}>{title}</H4>
      </div>
    </CardHeader>
  );
};

export default CommonCardHeader;
