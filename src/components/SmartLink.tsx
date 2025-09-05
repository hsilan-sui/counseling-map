import { AnchorHTMLAttributes } from "react";

type SmartLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  onSmartClick?: (
    e: React.MouseEvent<HTMLAnchorElement> | React.PointerEvent<HTMLAnchorElement>
  ) => void;
};

export default function SmartLink({
  onSmartClick,
  children,
  ...rest
}: SmartLinkProps) {
  return (
    <a
      {...rest}
      onPointerDown={(e) => {
        onSmartClick?.(e);
        rest.onPointerDown?.(e);
      }}
    >
      {children}
    </a>
  );
}
