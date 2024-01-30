import CountingNumbers from "@/components/counting-numbers";
import { Icons } from "@/components/icons";
import { MainNav } from "@/components/main-nav";
import { MobileNav } from "@/components/mobile-nav";
import { buttonVariants } from "@/components/ui/button";
import { UserAccountNav } from "@/components/user-account-nav";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { StarIcon } from "@heroicons/react/24/solid";
import { User } from "next-auth";
import Link from "next/link";

interface SiteHeaderProps {
  user?: User;
}

export async function SiteHeader({ user }: SiteHeaderProps) {
  return (
    <header className="supports-backdrop-blur:bg-background/80 sticky top-0 z-40 w-full backdrop-blur bg-background border-b">
      <div className="container flex h-16 items-center">
        <MainNav />
        <MobileNav />
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-between">
          <nav className="flex items-center gap-2">
            {/* <Link
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
            >
              <div
                className={cn(
                  buttonVariants({
                    variant: "ghost",
                  }),
                  "w-9 px-0"
                )}
              >
                <Icons.gitHub className="h-4 w-4" />
                <span className="sr-only">Github</span>
              </div>
            </Link> */}

            {/* <Link
              href={siteConfig.links.twitter}
              target="_blank"
              rel="noreferrer"
            >
              <div
                className={cn(
                  buttonVariants({
                    variant: "ghost",
                  }),
                  "w-9 px-0"
                )}
              >
                <Icons.twitter className="h-4 w-4 fill-current" />
                <span className="sr-only">Twitter</span>
              </div>
            </Link> */}
            {/* <ModeToggle /> */}

            {user && (
              <UserAccountNav
                user={{
                  name: user.name,
                  image: user.image,
                  email: user.email,
                }}
              />
            )}

            {!user && (
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "secondary", size: "lg" }),
                  "px-4 bg-gradient-to-r from-teal-600 to-gray-600 text-white"
                )}
              >
                Get Started
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
