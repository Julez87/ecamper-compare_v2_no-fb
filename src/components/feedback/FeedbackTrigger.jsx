import React from 'react';
import { ThumbsUp, ThumbsDown, HelpCircle } from 'lucide-react';

export default function FeedbackTrigger({ topic, onOpen }) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onOpen('positive', topic)}
        className="p-1.5 rounded-md text-slate-400 hover:text-emerald-500 hover:bg-slate-100 transition-colors"
        title="I like this"
      >
        <ThumbsUp className="w-4 h-4" />
      </button>
      <button
        onClick={() => onOpen('negative', topic)}
        className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-slate-100 transition-colors"
        title="Could be better"
      >
        <ThumbsDown className="w-4 h-4" />
      </button>
      <button
        onClick={() => onOpen('question', topic)}
        className="p-1.5 rounded-md text-slate-400 hover:text-violet-500 hover:bg-slate-100 transition-colors"
        title="I have a question"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
    </div>
  );
}