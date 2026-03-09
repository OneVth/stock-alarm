"use client";

import * as React from "react";
import type { Editor } from "@tiptap/react";
import { Link, Unlink } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Toggle } from "@/components/ui/toggle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/** LinkPopover Props */
interface LinkPopoverProps {
  /** 에디터 인스턴스 */
  editor: Editor;
}

/**
 * 링크 입력/제거 팝오버 컴포넌트
 *
 * @param props - LinkPopover 속성
 */
export function LinkPopover({ editor }: LinkPopoverProps) {
  const [url, setUrl] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const isActive = editor.isActive("link");

  const handleOpen = (nextOpen: boolean) => {
    if (nextOpen) {
      const currentUrl = editor.getAttributes("link").href || "";
      setUrl(currentUrl);
    }
    setOpen(nextOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url.trim() })
        .run();
    }
    setOpen(false);
  };

  const handleUnlink = () => {
    editor.chain().focus().unsetLink().run();
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger
        render={
          <Toggle
            variant="outline"
            size="sm"
            pressed={isActive}
            aria-label="링크"
          />
        }
      >
        <Link className="h-4 w-4" />
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="flex-1"
          />
          <Button type="submit" size="sm">
            적용
          </Button>
          {isActive && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleUnlink}
            >
              <Unlink className="h-4 w-4" />
            </Button>
          )}
        </form>
      </PopoverContent>
    </Popover>
  );
}
