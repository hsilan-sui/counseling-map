import { AnchorHTMLAttributes, MouseEvent } from "react";

type SmartLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  onSmartClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
};

export default function SmartLink({
  onSmartClick,
  children,
  onClick,
  ...rest
}: SmartLinkProps) {
  return (
    <a
      {...rest}
      onClick={(e) => {
        onSmartClick?.(e);
        onClick?.(e);
      }}
    >
      {children}
    </a>
  );
}
