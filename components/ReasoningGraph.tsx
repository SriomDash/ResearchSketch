import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ReasoningMap, NodeType, SimulationNode, SimulationLink, LinkStrength } from '../types';
import { NODE_COLORS, LINK_COLORS } from '../constants';

interface ReasoningGraphProps {
  data: ReasoningMap;
  onNodeClick: (nodeId: string) => void;
}

const ReasoningGraph: React.FC<ReasoningGraphProps> = ({ data, onNodeClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  
  // Tooltip state
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
    type: string;
  } | null>(null);

  // Handle Resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    
    window.addEventListener('resize', updateDimensions);
    updateDimensions();
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    const { width, height } = dimensions;

    const g = svg.append("g");

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Simulation Setup
    const nodes: SimulationNode[] = data.nodes.map(d => ({ ...d }));
    // Map 'from'/'to' to 'source'/'target' for D3, satisfying SimulationLink type
    const links: SimulationLink[] = data.links.map(d => ({ 
      ...d, 
      source: d.from, 
      target: d.to 
    }));

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide(40));

    // Arrow marker definitions
    const defs = svg.append("defs");
    Object.keys(LINK_COLORS).forEach((strength) => {
      defs.append("marker")
        .attr("id", `arrow-${strength}`)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 25) // Offset for node radius
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", LINK_COLORS[strength as LinkStrength]);
    });

    // Draw Links
    const link = g.append("g")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 2)
      .attr("stroke", d => LINK_COLORS[d.strength as LinkStrength])
      .attr("stroke-dasharray", d => d.strength === LinkStrength.WEAK ? "5,5" : null)
      .attr("marker-end", d => `url(#arrow-${d.strength})`);

    // Draw Nodes Group
    const node = g.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(d3.drag<SVGGElement, SimulationNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Tooltip Interactions
    node
      .on("mouseover", (event, d) => {
        setTooltip({
          visible: true,
          x: event.clientX,
          y: event.clientY,
          content: d.text,
          type: d.type
        });
      })
      .on("mousemove", (event) => {
        setTooltip(prev => prev ? {
          ...prev,
          x: event.clientX,
          y: event.clientY
        } : null);
      })
      .on("mouseout", () => {
        setTooltip(null);
      });

    // Node Circles
    node.append("circle")
      .attr("r", 15)
      .attr("fill", d => NODE_COLORS[d.type as NodeType] || "#94a3b8")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .attr("cursor", "pointer")
      .on("click", (event, d) => {
        event.stopPropagation();
        onNodeClick(d.id);
      });

    // Node Labels
    node.append("text")
      .text(d => d.text.length > 20 ? d.text.substring(0, 17) + "..." : d.text)
      .attr("x", 20)
      .attr("y", 5)
      .attr("fill", "#e2e8f0")
      .attr("font-size", "12px")
      .attr("font-weight", "500")
      .style("pointer-events", "none")
      .style("text-shadow", "0 1px 2px rgba(0,0,0,0.8)");

    // Simulation Update Tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as SimulationNode).x!)
        .attr("y1", d => (d.source as SimulationNode).y!)
        .attr("x2", d => (d.target as SimulationNode).x!)
        .attr("y2", d => (d.target as SimulationNode).y!);

      node
        .attr("transform", d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any, d: SimulationNode) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: SimulationNode) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: SimulationNode) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [data, dimensions, onNodeClick]);

  return (
    <div ref={containerRef} className="w-full h-full bg-slate-900 overflow-hidden relative rounded-lg border border-slate-700 shadow-inner">
      <svg ref={svgRef} className="w-full h-full" />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-slate-800/80 p-3 rounded text-xs text-slate-300 backdrop-blur-sm border border-slate-700 pointer-events-none">
        <div className="font-bold mb-1">Node Types</div>
        {Object.entries(NODE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2 mb-1">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
            <span className="capitalize">{type}</span>
          </div>
        ))}
        <div className="mt-2 font-bold mb-1">Connections</div>
        <div className="flex items-center gap-2 mb-1">
           <span className="w-4 h-0.5 bg-slate-400"></span>
           <span>Supported</span>
        </div>
        <div className="flex items-center gap-2">
           <span className="w-4 h-0.5 border-t border-red-500 border-dashed"></span>
           <span>Weak / Assumed</span>
        </div>
      </div>

      {/* Interactive Tooltip */}
      {tooltip && tooltip.visible && (
        <div 
          className="fixed z-50 p-3 max-w-xs text-sm bg-slate-800 text-slate-200 border border-slate-500 rounded-lg shadow-2xl pointer-events-none backdrop-blur-md"
          style={{ 
            left: tooltip.x + 15, 
            top: tooltip.y + 15 
          }}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            {tooltip.type}
          </div>
          <div className="leading-snug">
            {tooltip.content}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReasoningGraph;