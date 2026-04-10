'use client';

import { createContext, useContext } from 'react';

export const ViewportCtx = createContext<'desktop' | 'tablet' | 'mobile'>('desktop');
export const useViewport = () => useContext(ViewportCtx);
