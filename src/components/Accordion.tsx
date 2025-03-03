import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClick: () => void;
}

function AccordionItem({ title, children, isOpen, onClick }: AccordionItemProps) {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        className={`w-full text-left p-6 flex justify-between items-center transition-colors duration-200 ${
          isOpen 
            ? 'bg-kapstone-sage text-white' 
            : 'hover:bg-kapstone-sage hover:text-white'
        }`}
        onClick={onClick}
      >
        <span className="text-xl font-semibold">{title}</span>
        <ChevronDown
          className={`h-5 w-5 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? 'max-h-[2000px]' : 'max-h-0'
        }`}
      >
        <div className="p-6 bg-white">{children}</div>
      </div>
    </div>
  );
}

interface AccordionProps {
  items: {
    title: string;
    content: React.ReactNode;
  }[];
}

export function Accordion({ items }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          title={item.title}
          isOpen={openIndex === index}
          onClick={() => setOpenIndex(openIndex === index ? null : index)}
        >
          {item.content}
        </AccordionItem>
      ))}
    </div>
  );
}