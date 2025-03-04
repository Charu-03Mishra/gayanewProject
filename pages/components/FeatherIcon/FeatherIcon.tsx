import * as Icon from "react-feather";

interface FeatherIconType {
  iconName: keyof typeof Icon;
  className?: string;
  onClick?: () => void;
}

const FeatherIcon: React.FC<FeatherIconType> = ({
  iconName,
  className,
  onClick,
}) => {
  const IconComp = Icon[iconName];
  if (!IconComp) {
    console.error(`Icon "${iconName}" is not defined in react-feather`);
    return null; // Return null or a fallback element
  }
  return <IconComp className={className} onClick={onClick} />;
};

export default FeatherIcon;
