import { ButtonHTMLAttributes, MouseEvent } from "react";

type SmartButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  onSmartClick?: (e: MouseEvent<HTMLButtonElement>) => void;
};

export default function SmartButton({
  onSmartClick,
  children,
  onClick,
  ...rest
}: SmartButtonProps) {
  return (
    <button
      {...rest}
      // ✅ 將行為綁在 click，避免 iOS 第一次只進入 pointer/focus
      onClick={(e) => {
        onSmartClick?.(e);
        onClick?.(e);
      }}
    >
      {children}
    </button>
  );
}
