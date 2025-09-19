
import React from "react";
import type { ComponentPropsWithoutRef, ForwardedRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SiteHeader } from "../SiteHeader";

// 简单模拟 Next.js 的 Link 与 Image，保证测试环境稳定。
vi.mock("next/link", () => {
  type MockLinkProps = ComponentPropsWithoutRef<"a"> & {
    href?: string | URL;
    prefetch?: boolean;
  };

  const MockLink = React.forwardRef<HTMLAnchorElement, MockLinkProps>(
    ({ href, children, prefetch: _prefetch, ...rest }, ref: ForwardedRef<HTMLAnchorElement>) => {
      void _prefetch;
      return (
        <a ref={ref} href={typeof href === "string" ? href : href?.toString() ?? "#"} {...rest}>
          {children}
        </a>
      );
    }
  );

  MockLink.displayName = "NextLinkMock";
  return { __esModule: true, default: MockLink };
});

vi.mock("next/image", () => {
  type MockImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
    src: string | { src: string };
    alt: string;
  };

  return {
    __esModule: true,
    default: ({ src, alt, ...rest }: MockImageProps) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={typeof src === "string" ? src : src.src} alt={alt} {...rest} />
    ),
  };
});

describe("SiteHeader", () => {
  it("renders primary navigation labels", () => {
    render(<SiteHeader />);

    expect(screen.getByText("Xingyi Sports")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "背负系统" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "服饰配件" })).toBeInTheDocument();
  });

  it("supports keyboard interaction to open mega menu", async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);

    const [trigger] = screen.getAllByRole("button", { name: "背负系统" });
    trigger.focus();
    expect(trigger).toHaveFocus();

    await user.keyboard("{Enter}");

    expect(screen.getByRole("link", { name: /远征 Pro 55L/ })).toBeVisible();
  });
});
