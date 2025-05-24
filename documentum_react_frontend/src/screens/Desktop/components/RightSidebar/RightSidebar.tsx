import React, { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { ScrollArea, ScrollBar } from "components/ui/scroll-area";
import { Separator } from "components/ui/separator";
import { MediaCard } from "./MediaCard";
import { X as XIcon, Move, ArrowLeftFromLine } from "lucide-react";

interface RightSidebarProps {
  isExpanded: boolean;
  isFloating: boolean;
  onToggle: (isFloating: boolean) => void;
  onExpand: (isExpanded: boolean) => void;
  className?: string;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ isExpanded, isFloating, onToggle, onExpand, className }) => {
  const [isImageMode, setIsImageMode] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [position, setPosition] = useState({ x: window.innerWidth - 248, y: 103 });
  const [size, setSize] = useState({ width: 248, height: 'auto' });
  const floatingRef = useRef<HTMLDivElement>(null);
  const resizingRef = useRef<{ isResizing: boolean; edge: 'left' | 'right' | null }>({ isResizing: false, edge: null });

  const toggleSwitch = useCallback(() => {
    setIsImageMode(prev => !prev);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchText("");
  }, []);

  const toggleFloating = useCallback(() => {
    onToggle(!isFloating);
    if (!isFloating) {
      setPosition({ x: window.innerWidth - 248, y: 103 });
      setSize({ width: 248, height: 'auto' });
    }
  }, [isFloating, onToggle]);

  const toggleExpanded = useCallback(() => {
    if (typeof onExpand === 'function') {
      onExpand(!isExpanded);
    } else {
      onToggle(!isExpanded);
    }
  }, [isExpanded, onExpand, onToggle]);

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX - position.x;
    const startY = e.clientY - position.y;
    
    const handleDrag = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - startX,
        y: e.clientY - startY
      });
    };
    
    const handleDragEnd = () => {
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', handleDragEnd);
    };
    
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleDragEnd);
  }, [position]);

  const handleResizeStart = useCallback((e: React.MouseEvent, edge: 'left' | 'right') => {
    e.preventDefault();
    resizingRef.current = { isResizing: true, edge };
    const startX = e.clientX;
    const startWidth = size.width;
    
    const handleResize = (e: MouseEvent) => {
      if (resizingRef.current.edge === 'right') {
        const newWidth = startWidth + (e.clientX - startX);
        setSize(prev => ({ ...prev, width: Math.max(248, newWidth) }));
      } else {
        const newWidth = startWidth - (e.clientX - startX);
        if (newWidth >= 248) {
          setSize(prev => ({ ...prev, width: newWidth }));
          setPosition(prev => ({ ...prev, x: prev.x - (newWidth - startWidth) }));
        }
      }
    };
    
    const handleResizeEnd = () => {
      resizingRef.current = { isResizing: false, edge: null };
      document.removeEventListener('mousemove', handleResize);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
    
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', handleResizeEnd);
  }, [size.width]);

  const renderContent = useCallback(() => (
    <>
      <div className="relative w-full h-12">
        <div className="absolute top-0.5 left-0 w-full">
          <Separator className="h-px w-full" />
        </div>
        <h2 className="absolute w-[134px] h-[26px] top-[11px] left-0 font-['Roboto',Helvetica] font-extrabold text-black text-[32px] tracking-[0] leading-normal whitespace-nowrap">
          Médias
        </h2>
      </div>

      <div className={`my-6 ${isFloating ? 'flex justify-start' : 'flex justify-center'}`}>
        <div className="relative flex items-center justify-center gap-3 w-[175px]">
          <img
            className={`w-8 h-8 cursor-pointer transition-opacity duration-300 ${isImageMode ? 'opacity-100' : 'opacity-50'}`}
            alt="Images"
            src="https://c.animaapp.com/macke9kyh9ZtZh/img/images.svg"
            onClick={() => setIsImageMode(true)}
          />
          <div 
            className="relative w-10 h-6 bg-gray-300 rounded-full cursor-pointer"
            onClick={toggleSwitch}
          >
            <div 
              className={`absolute w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                isImageMode ? 'translate-x-0' : 'translate-x-full'
              }`}
              style={{top: '2px', left: '2px'}}
            />
          </div>
          <img
            className={`w-8 h-8 cursor-pointer transition-opacity duration-300 ${!isImageMode ? 'opacity-100' : 'opacity-50'}`}
            alt="Video"
            src="https://c.animaapp.com/macke9kyh9ZtZh/img/video.svg"
            onClick={() => setIsImageMode(false)}
          />
        </div>
      </div>

      <div className="relative mb-4">
        <div className="flex items-center border-[3px] border-solid border-[#65558f] rounded-[10px] p-1">
          <Button variant="ghost" className="p-2 h-12 w-12">
            <img
              className="w-6 h-6"
              alt="SearchIcon icon"
              src="https://c.animaapp.com/macke9kyh9ZtZh/img/icon-3.svg"
            />
          </Button>
          <div className="flex-1 relative">
            <Input
              className="border-none focus-visible:ring-0 h-12 font-m3-body-large text-m3syslighton-surface"
              placeholder="Input"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <span className="inline-flex items-center px-1 py-0 absolute -top-3 -left-9 bg-[#f7a900] text-m-3syslightprimary font-m3-body-small">
              Recherche
            </span>
          </div>
          <Button 
            variant="ghost" 
            className="p-2 h-12 w-12"
            onClick={handleClearSearch}
          >
            <XIcon className="w-6 h-6" />
          </Button>
        </div>
      </div>

      <div className="flex justify-between mb-4">
        <Button
          variant="ghost"
          className="flex items-center gap-2 pl-3 pr-4 py-2.5 h-10 rounded-[100px]"
        >
          <img
            className="w-[18px] h-[18px]"
            alt="Filter icon"
            src="https://c.animaapp.com/macke9kyh9ZtZh/img/icon-9.svg"
          />
          <span className="font-m3-label-large text-m-3syslightprimary">
            Label
          </span>
        </Button>

        <Button variant="ghost" className="p-2 h-10 rounded-[100px]">
          <img
            className="w-6 h-6"
            alt="More options"
            src="https://c.animaapp.com/macke9kyh9ZtZh/img/icon-5.svg"
          />
        </Button>
      </div>

      <ScrollArea className="h-[calc(100%-280px)] bg-white rounded-[15px] shadow-[inset_0px_4px_4px_#00000040]">
        <div className={`p-6 grid gap-5 ${size.width > 500 ? 'grid-cols-2' : 'grid-cols-1'} ${size.width > 750 ? 'grid-cols-3' : ''}`}>
          {[
            {
              id: 1,
              title: "Title",
              updatedText: "Updated today",
              imageUrl: "https://c.animaapp.com/macke9kyh9ZtZh/img/image-2.png",
            },
            {
              id: 2,
              title: "Title",
              updatedText: "Updated yesterday",
              imageUrl: "https://c.animaapp.com/macke9kyh9ZtZh/img/image-2.png",
            },
            {
              id: 3,
              title: "Title",
              updatedText: "Updated 2 days ago",
              imageUrl: "https://c.animaapp.com/macke9kyh9ZtZh/img/image-2.png",
            },
          ].map((card) => (
            <MediaCard key={card.id} {...card} />
          ))}
        </div>
        <ScrollBar
          orientation="vertical"
          className="w-2.5 bg-[#d9d9d9] rounded-[15px] shadow-[inset_0px_4px_4px_#00000040] blur-[2px]"
        >
          <div className="w-2.5 h-[45px] mt-6 ml-0.5 bg-black rounded-[15px]" />
        </ScrollBar>
      </ScrollArea>
    </>
  ), [isImageMode, searchText, size.width, isFloating, handleClearSearch, toggleSwitch]);

  const floatingWindow = (
    <div
      ref={floatingRef}
      className="fixed bg-[#f7a900] rounded-[15px] shadow-lg overflow-hidden"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: `${size.width}px`,
        height: size.height,
        zIndex: 9999,
      }}
    >
      <div className="p-4 h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div
            className="cursor-move p-2 rounded-md hover:bg-gray-200 transition-colors duration-200"
            onMouseDown={handleDragStart}
          >
            <Move className="w-8 h-8 text-gray-600" />
          </div>
          <Button
            variant="ghost"
            className="p-1 h-8 w-8 hover:bg-gray-200 transition-colors duration-200"
            onClick={() => onToggle(false)}
            title="Dock sidebar"
          >
            <ArrowLeftFromLine className="w-6 h-6 text-gray-600" />
          </Button>
        </div>
        <div className="flex-grow overflow-hidden">
          {renderContent()}
        </div>
      </div>
      <div
        className="absolute top-0 left-0 w-1 h-full cursor-ew-resize"
        onMouseDown={(e) => handleResizeStart(e, 'left')}
      />
      <div
        className="absolute top-0 right-0 w-1 h-full cursor-ew-resize"
        onMouseDown={(e) => handleResizeStart(e, 'right')}
      />
    </div>
  );

  return (
    <>
      {!isFloating && (
        <div 
          className={`fixed top-[103px] bottom-0 right-0 transition-all duration-300 ease-in-out ${className}`} 
          style={{ width: isExpanded ? '248px' : '0' }}
        >
          <div className="relative h-full">
            <div className={`h-full bg-[#f7a900] rounded-l-[15px] transition-all duration-300 ease-in-out`} style={{ width: '248px', transform: isExpanded ? 'translateX(0)' : 'translateX(248px)' }}>
              <div className="pt-20 px-4 h-full overflow-hidden">
                <div className="absolute top-4 right-4">
                  <Button
                    variant="ghost"
                    className="p-1 h-8 w-8 hover:bg-gray-200 transition-colors duration-200"
                    onClick={() => onToggle(true)}
                    title="Detach sidebar"
                  >
                    <Move className="w-6 h-6 text-gray-600" />
                  </Button>
                </div>
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      )}
      {!isFloating && (
        <Button
          variant="ghost"
          className={`fixed top-[123px] p-0 h-12 w-12 z-50 transition-all duration-300 ease-in-out hover:bg-gray-200`}
          style={{ 
            right: isExpanded ? '248px' : '0',
            transform: 'translateX(50%)'
          }}
          onClick={toggleExpanded}
          title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          <img
            className={`w-full h-full transition-transform duration-300 ${isExpanded ? '' : 'rotate-180'}`}
            alt="Rightbar toggle"
            src="https://c.animaapp.com/macke9kyh9ZtZh/img/rightbar-collapse.svg"
          />
        </Button>
      )}
      {isFloating && createPortal(floatingWindow, document.body)}
    </>
  );
};
