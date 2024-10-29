import { useRef, useEffect } from 'react';
import * as d3 from 'd3';

export const useD3 = (renderChartFn: (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) => void, dependencies: any[]) => {
    const ref = useRef<SVGSVGElement>(null);
  
    useEffect(() => {
      if (ref.current) {
        renderChartFn(d3.select(ref.current));
      }
      return () => {
        d3.select(ref.current).selectAll("*").remove();
      };
    }, dependencies);
  
    return ref;
  };