import { ButtonHTMLAttributes } from "react";

type SmartButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    // handler 只要寫一次
    onSmartClick?: (e: React.MouseEvent<HTMLButtonElement> | React.PointerEvent<HTMLButtonElement>) => void;
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
        onClick={(e) => {
          onSmartClick?.(e);
          rest.onClick?.(e);
        }}
      >
        {children}
      </button>
    );
  }
