/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
// Props interface for the gradient animation component
interface BackgroundGradientAnimationProps {
  gradientBackgroundStart?: string;
  gradientBackgroundEnd?: string;
  firstColor?: string;
  secondColor?: string;
  thirdColor?: string;
  fourthColor?: string;
  fifthColor?: string;
  pointerColor?: string;
  size?: string;
  blendingValue?: string;
  children?: React.ReactNode;
  className?: string;
  interactive?: boolean;
  containerClassName?: string;
}
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

export const BackgroundGradientAnimation = ({
  gradientBackgroundStart = "rgb(30, 30, 60)",
  gradientBackgroundEnd = "rgb(10, 20, 40)",
  firstColor = "255, 215, 0", // Gold (#FFD700)
  secondColor = "0, 217, 255", // Teal/Cyan (#00D9FF)
  thirdColor = "255, 215, 0", // Gold (repeat for simplicity)
  fourthColor = "0, 217, 255", // Teal/Cyan (repeat for simplicity)
  fifthColor = "255, 215, 0", // Gold (repeat for simplicity)
  pointerColor = "255, 215, 0", // Gold highlight
  size = "160%",
  blendingValue = "hard-light",
  children,
  className,
  interactive = true,
  containerClassName,
}: BackgroundGradientAnimationProps) => {
  const interactiveRef = useRef<HTMLDivElement>(null);

  const [curX, setCurX] = useState<number>(0);
  const [curY, setCurY] = useState<number>(0);
  const [tgX, setTgX] = useState<number>(0);
  const [tgY, setTgY] = useState<number>(0);

  useEffect(() => {
    document.body.style.setProperty(
      "--gradient-background-start",
      gradientBackgroundStart,
    );
    document.body.style.setProperty(
      "--gradient-background-end",
      gradientBackgroundEnd,
    );
    document.body.style.setProperty("--first-color", firstColor);
    document.body.style.setProperty("--second-color", secondColor);
    document.body.style.setProperty("--third-color", thirdColor);
    document.body.style.setProperty("--fourth-color", fourthColor);
    document.body.style.setProperty("--fifth-color", fifthColor);
    document.body.style.setProperty("--pointer-color", pointerColor);
    document.body.style.setProperty("--size", size);
    document.body.style.setProperty("--blending-value", blendingValue);
  }, [
    gradientBackgroundStart,
    gradientBackgroundEnd,
    firstColor,
    secondColor,
    thirdColor,
    fourthColor,
    fifthColor,
    pointerColor,
    size,
    blendingValue,
  ]);

  useEffect(() => {
    function move() {
      if (!interactiveRef.current) return;
      setCurX((prevCurX) => {
        const newCurX = prevCurX + (tgX - prevCurX) / 20;
        setCurY((prevCurY) => {
          const newCurY = prevCurY + (tgY - prevCurY) / 20;
          interactiveRef.current!.style.transform = `translate(${Math.round(
            newCurX,
          )}px, ${Math.round(newCurY)}px)`;
          return newCurY;
        });
        return newCurX;
      });
    }
    move();
  }, [tgX, tgY]); // curX and curY removed here!

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (interactiveRef.current) {
      const rect = interactiveRef.current.getBoundingClientRect();
      setTgX(event.clientX - rect.left);
      setTgY(event.clientY - rect.top);
    }
  };

  const [isSafari] = useState<boolean>(
    /^((?!chrome|android).)*safari/i.test(
      typeof navigator !== "undefined" ? navigator.userAgent : "",
    ),
  );

  return (
    <div
      className={cn(
        "min-h-screen w-full relative overflow-hidden bg-transparent",
        containerClassName,
      )}
      onMouseMove={handleMouseMove}
    >
      {/* Filter definition */}
      <svg className="hidden">
        <defs>
          <filter id="blurMe">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="10"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {/* Form/content goes here */}
      <div className={cn("relative z-10", className)}>{children}</div>

      {/* Animated gradient blobs */}
      <div
        className={cn(
          "gradients-container fixed inset-x-0 bottom-0 h-[40vh] blur-lg pointer-events-none",
          isSafari ? "blur-2xl" : "filter-[url(#blurMe)_blur(40px)]",
        )}
      >
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,var(--first-color)_0,var(--first-color)_50%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)] w-(--size) h-(--size)`,
            `top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)]`,
            `animate-first opacity-80`,
          )}
        />
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,rgba(var(--second-color),0.6)_0,rgba(var(--second-color),0)_50%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)] w-(--size) h-(--size)`,
            `top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)]`,
            `origin-[calc(50%-400px)] animate-second opacity-80`,
          )}
        />
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,rgba(var(--third-color),0.6)_0,rgba(var(--third-color),0)_50%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)] w-(--size) h-(--size)`,
            `top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)]`,
            `origin-[calc(50%+400px)] animate-third opacity-80`,
          )}
        />
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,rgba(var(--fourth-color),0.5)_0,rgba(var(--fourth-color),0)_50%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)] w-(--size) h-(--size)`,
            `top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)]`,
            `origin-[calc(50%-200px)] animate-fourth opacity-80`,
          )}
        />
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,rgba(var(--fifth-color),0.5)_0,rgba(var(--fifth-color),0)_50%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)] w-(--size) h-(--size)`,
            `top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)]`,
            `origin-[calc(50%-800px)_calc(50%+800px)] animate-fifth opacity-80`,
          )}
        />

        {interactive && (
          <div
            ref={interactiveRef}
            className={cn(
              `absolute [background:radial-gradient(circle_at_center,rgba(var(--pointer-color),0.8)_0,rgba(var(--pointer-color),0)_50%)_no-repeat]`,
              `[mix-blend-mode:var(--blending-value)] w-full h-full -top-1/2 -left-1/2 opacity-70 pointer-events-none`,
            )}
          />
        )}
      </div>
    </div>
  );
};
