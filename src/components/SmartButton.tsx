import { ButtonHTMLAttributes } from "react";

type SmartButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  onSmartClick?: (e: React.PointerEvent<HTMLButtonElement>) => void;
};

export default function SmartButton({
  onSmartClick,
  children,
  ...rest
}: SmartButtonProps) {
  return (
    <button
      {...rest}
      onPointerDown={(e) => {
        onSmartClick?.(e);
        rest.onPointerDown?.(e);
      }}
    >
      {children}
    </button>
  );
}
