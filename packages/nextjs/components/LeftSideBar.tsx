"use client";

import React, { useCallback, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Home, MessageSquare, ShoppingBag, Sparkles, User } from "lucide-react";
import { useOutsideClick } from "~~/hooks/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
    icon: <Home className="h-4 w-4" />,
  },

  {
    label: "Create",
    href: "/create",
    icon: <Sparkles className="h-4 w-4" />,
  },
  {
    label: "Marketplace",
    href: "/marketplace",
    icon: <ShoppingBag className="h-4 w-4" />,
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: <Bell className="h-4 w-4" />,
  },
  {
    label: "Messages",
    href: "/messages",
    icon: <MessageSquare className="h-4 w-4" />,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: <User className="h-4 w-4" />,
  },
];

export const HeaderMenuLinks = ({ start, end, className }: { start: number; end: number; className?: string }) => {
  const pathname = usePathname();

  return (
    <div className={`flex flex-col items-start w-1/2 gap-4 ${className}`}>
      {menuLinks.slice(start, end).map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            href={href}
            passHref
            key={href}
            className={`${
              isActive ? "bg-secondary shadow-md" : ""
            } hover:bg-secondary hover:shadow-md focus:!bg-secondary active:!text-white py-2.5 px-5 text-sm rounded-s gap-4 flex flex-row items-center dark:text-white text-black`}
          >
            {icon}
            <span className="text-xl">{label}</span>
          </Link>
        );
      })}
    </div>
  );
};

/**
 * Site header
 */
export const LeftSideBar = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const burgerMenuRef = useRef<HTMLDivElement>(null);
  useOutsideClick(
    burgerMenuRef,
    useCallback(() => setIsDrawerOpen(false), []),
  );

  return (
    <div
      className="sticky top-0 flex flex-col items-center w-[25%] container min-h-full max-h-screen shadow-[1px_0_0_0_rgba(255,255,255,0.1)]"
      style={{ backdropFilter: "blur(10px)" }}
    >
      <Link href="/" passHref>
        <Image
          src="/logo.png"
          width={100}
          height={300}
          alt="logo"
          className="size-[184px] hover:scale-110 transition-transform duration-300 cursor-pointer"
        />
      </Link>
      <HeaderMenuLinks start={0} end={3} />
      <div className="flex-1" />
      <HeaderMenuLinks start={4} end={6} className="py-10" />
    </div>
  );
};
