"use client";

import * as React from "react";
import {
  Cloud,
  CreditCard,
  Github,
  Keyboard,
  LifeBuoy,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  PlusCircle,
  Settings,
  User,
  UserPlus,
  Users,
  CalendarDays,
} from "lucide-react";
import { ComponentSection } from "../_components/component-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  ContextMenuCheckboxItem,
} from "@/components/ui/context-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function OverlayShowcase() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Overlay & Popup</h1>
        <p className="mt-2 text-muted-foreground">7 components</p>
      </div>

      <ComponentSection
        title="Dialog"
        description="Modal dialog window (form input, etc.)"
      >
        <Dialog>
          <DialogTrigger render={<Button />}>
            Edit Profile
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  defaultValue="Hong Gil-dong"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input
                  id="username"
                  defaultValue="@honggildong"
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </ComponentSection>

      <ComponentSection
        title="Sheet"
        description="Slide-in panel from screen edge (top, right, bottom, left)"
      >
        <div className="flex flex-wrap gap-2">
          {(["top", "right", "bottom", "left"] as const).map((side) => (
            <Sheet key={side}>
              <SheetTrigger render={<Button variant="outline" className="capitalize" />}>
                {side}
              </SheetTrigger>
              <SheetContent side={side}>
                <SheetHeader>
                  <SheetTitle>Sheet ({side})</SheetTitle>
                  <SheetDescription>
                    This is a sheet panel sliding from the {side}.
                  </SheetDescription>
                </SheetHeader>
                <div className="py-4">
                  <p className="text-sm text-muted-foreground">
                    Content goes here.
                  </p>
                </div>
                <SheetFooter>
                  <SheetClose render={<Button />}>
                    Close
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          ))}
        </div>
      </ComponentSection>

      <ComponentSection
        title="Popover"
        description="Click-triggered popover (form/settings)"
      >
        <Popover>
          <PopoverTrigger render={<Button variant="outline" />}>
            Open Popover
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Dimensions</h4>
                <p className="text-sm text-muted-foreground">
                  Set the dimensions for the layer.
                </p>
              </div>
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="width">Width</Label>
                  <Input
                    id="width"
                    defaultValue="100%"
                    className="col-span-2 h-8"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="height">Height</Label>
                  <Input
                    id="height"
                    defaultValue="25px"
                    className="col-span-2 h-8"
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </ComponentSection>

      <ComponentSection
        title="Tooltip"
        description="Hover-triggered short description"
      >
        <div className="flex gap-4">
          <Tooltip>
            <TooltipTrigger render={<Button variant="outline" size="icon" />}>
              <Plus className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Add to library</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger render={<Button variant="outline" size="icon" />}>
              <Settings className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger render={<Button variant="outline" size="icon" />}>
              <User className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Profile</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </ComponentSection>

      <ComponentSection
        title="Dropdown Menu"
        description="Click-opened dropdown menu (groups, shortcuts, separators)"
      >
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>
            Open Menu
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
                <DropdownMenuShortcut>Ctrl+P</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Billing</span>
                <DropdownMenuShortcut>Ctrl+B</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
                <DropdownMenuShortcut>Ctrl+S</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Keyboard className="mr-2 h-4 w-4" />
                <span>Shortcuts</span>
                <DropdownMenuShortcut>Ctrl+K</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Users className="mr-2 h-4 w-4" />
                <span>Team</span>
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <UserPlus className="mr-2 h-4 w-4" />
                  <span>Invite users</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>
                    <Mail className="mr-2 h-4 w-4" />
                    <span>Email</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>Message</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    <span>More...</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem>
                <Plus className="mr-2 h-4 w-4" />
                <span>New Team</span>
                <DropdownMenuShortcut>Ctrl+T</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Github className="mr-2 h-4 w-4" />
              <span>GitHub</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LifeBuoy className="mr-2 h-4 w-4" />
              <span>Support</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Cloud className="mr-2 h-4 w-4" />
              <span>API</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
              <DropdownMenuShortcut>Ctrl+Q</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ComponentSection>

      <ComponentSection
        title="Context Menu"
        description="Right-click context menu (submenu support)"
      >
        <ContextMenu>
          <ContextMenuTrigger className="flex h-[150px] w-full items-center justify-center rounded-md border border-dashed text-sm">
            Right click here
          </ContextMenuTrigger>
          <ContextMenuContent className="w-64">
            <ContextMenuItem>
              Back <ContextMenuShortcut>Alt+Left</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem disabled>
              Forward <ContextMenuShortcut>Alt+Right</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem>
              Reload <ContextMenuShortcut>Ctrl+R</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuSub>
              <ContextMenuSubTrigger>More Tools</ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-48">
                <ContextMenuItem>Save Page As...</ContextMenuItem>
                <ContextMenuItem>Create Shortcut...</ContextMenuItem>
                <ContextMenuItem>Name Window...</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem>Developer Tools</ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSeparator />
            <ContextMenuCheckboxItem checked>
              Show Bookmarks Bar
            </ContextMenuCheckboxItem>
            <ContextMenuCheckboxItem>Show Full URLs</ContextMenuCheckboxItem>
          </ContextMenuContent>
        </ContextMenu>
      </ComponentSection>

      <ComponentSection
        title="Hover Card"
        description="Hover-triggered detail info card"
      >
        <HoverCard>
          <HoverCardTrigger render={<Button variant="link" />}>
            @stock_alarm
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="flex justify-between space-x-4">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>SA</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">@stock_alarm</h4>
                <p className="text-sm">
                  Stock price monitoring and smart alert service.
                </p>
                <div className="flex items-center pt-2">
                  <CalendarDays className="mr-2 h-4 w-4 opacity-70" />
                  <span className="text-xs text-muted-foreground">
                    Joined March 2026
                  </span>
                </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </ComponentSection>
    </div>
  );
}
