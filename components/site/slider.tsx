"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

interface SliderProps extends SliderPrimitive.SliderProps {}

export function Slider({ className, ...props }: SliderProps) {
  return (
    <SliderPrimitive.Root
      className={cn("relative flex w-full touch-none select-none items-center", className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted">
        <SliderPrimitive.Range className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary bg-background shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary" />
      <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary bg-background shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary" />
    </SliderPrimitive.Root>
  );
}
