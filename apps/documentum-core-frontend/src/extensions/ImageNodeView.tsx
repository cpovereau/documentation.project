import React from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'

export const ImageNodeView: React.FC<NodeViewProps> = ({ node }) => {
  const { src, alt, width, height, float: floatAttr } = node.attrs
  const style: React.CSSProperties = {}
  if (width)                          style.width  = width
  if (height)                         style.height = height
  if (floatAttr && floatAttr !== 'none') style.float = floatAttr as 'left' | 'right'

  return (
    <NodeViewWrapper>
      <img
        src={src}
        alt={alt ?? ''}
        style={style}
        draggable={false}
        className="tiptap-image max-w-full"
      />
    </NodeViewWrapper>
  )
}
