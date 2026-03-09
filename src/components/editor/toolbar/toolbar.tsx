"use client";

import type { Editor } from "@tiptap/react";
import { Bold, Italic, List, ListOrdered } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ToolbarButton } from "./toolbar-button";
import { LinkPopover } from "./link-popover";

/** Toolbar Props */
interface ToolbarProps {
  /** 에디터 인스턴스 */
  editor: Editor;
}

/**
 * 에디터 메인 툴바 컴포넌트
 *
 * @param props - Toolbar 속성
 */
export function Toolbar({ editor }: ToolbarProps) {
  return (
    <div className="flex items-center gap-1 border-b p-1">
      <ToolbarButton
        pressed={editor.isActive("bold")}
        onPressedChange={() =>
          editor.chain().focus().toggleBold().run()
        }
        aria-label="굵게"
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        pressed={editor.isActive("italic")}
        onPressedChange={() =>
          editor.chain().focus().toggleItalic().run()
        }
        aria-label="기울임"
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ToolbarButton
        pressed={editor.isActive("bulletList")}
        onPressedChange={() =>
          editor.chain().focus().toggleBulletList().run()
        }
        aria-label="글머리 기호 목록"
      >
        <List className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        pressed={editor.isActive("orderedList")}
        onPressedChange={() =>
          editor.chain().focus().toggleOrderedList().run()
        }
        aria-label="번호 목록"
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <LinkPopover editor={editor} />
    </div>
  );
}
