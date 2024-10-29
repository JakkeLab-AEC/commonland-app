import React, { useEffect, useRef } from "react";
import { useD3 } from "./d3Hook";
import * as d3 from "d3";

interface DataPoint {
    name: string;
    value: number;
}

interface D3LineChartProps {
    data: DataPoint[];
    width?: number;
    height?: number;
}

export const D3LineChart: React.FC<D3LineChartProps> = ({data, width, height}) => {
    const ref = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!ref.current) return;
    
        const svg = d3.select(ref.current);
        svg.selectAll("*").remove();
    
        const svgWidth = width ? width : ref.current.clientWidth;
        const svgHeight = height ? height : ref.current.clientHeight;
    
        const margin = { top: 20, right: 30, bottom: 30, left: 40 };
        const paddingLeft = 20;

        const x = d3
          .scalePoint()
          .domain(data.map((d) => d.name))
          .range([margin.left + paddingLeft, svgWidth - margin.right]);
    
        const y = d3
          .scaleLinear()
          .domain([0, d3.max(data, (d) => d.value) || 1])
          .nice()
          .range([svgHeight - margin.bottom, margin.top]);
    
        const line = d3
          .line<DataPoint>()
          .x((d) => x(d.name)!)
          .y((d) => y(d.value));
    
        svg
          .append("g")
          .attr("transform", `translate(0,${svgHeight - margin.bottom})`)
          .call(d3.axisBottom(x));
    
        svg
          .append("g")
          .attr("transform", `translate(${margin.left},0)`)
          .call(d3.axisLeft(y));
    
        svg
          .append("path")
          .datum(data)
          .attr("fill", "none")
          .attr("stroke", "steelblue")
          .attr("stroke-width", 1.5)
          .attr("d", line);

          svg
          .selectAll("circle")
          .data(data)
          .enter()
          .append("circle")
          .attr("cx", (d) => x(d.name)!)
          .attr("cy", (d) => y(d.value))
          .attr("r", 4) // 원의 반지름
          .attr("fill", "steelblue");
      }, [data, width, height]);    

    
      return (
        <svg
          ref={ref}
          className={`${width ? width : 'w-full'} ${height ? height : 'h-full'}`}
          style={{ 
            width: width ? width : '',
            height: height ? height: ''
          }}
        />
      );
}