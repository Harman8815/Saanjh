'use client';

import { useEffect, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

interface GuestNode {
  id: string;
  name: string;
  group: 'bride' | 'groom';
  rsvpStatus: 'confirmed' | 'pending' | 'declined';
  table?: string;
  plusOne?: boolean;
}

interface GuestLink {
  source: string;
  target: string;
  relationship: string;
}

interface GraphData {
  nodes: GuestNode[];
  links: GuestLink[];
}

export default function GuestRelationshipGraph() {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const graphRef = useRef<any>(null);

  // Generate fake guest data with relationships
  useEffect(() => {
    const generateFakeGuestData = (): GraphData => {
      const guests: GuestNode[] = [
        // Bride side
        { id: 'sarah-bride', name: 'Sarah Johnson', group: 'bride', rsvpStatus: 'confirmed', table: 'A1', plusOne: true },
        { id: 'emma-bride', name: 'Emma Wilson', group: 'bride', rsvpStatus: 'confirmed', table: 'A1' },
        { id: 'jessica-bride', name: 'Jessica Brown', group: 'bride', rsvpStatus: 'pending', table: 'A2' },
        { id: 'megan-bride', name: 'Megan Davis', group: 'bride', rsvpStatus: 'confirmed', table: 'A2', plusOne: true },
        { id: 'ashley-bride', name: 'Ashley Miller', group: 'bride', rsvpStatus: 'confirmed', table: 'A3' },
        { id: 'lisa-bride', name: 'Lisa Anderson', group: 'bride', rsvpStatus: 'declined', table: 'A3' },
        { id: 'rachel-bride', name: 'Rachel Taylor', group: 'bride', rsvpStatus: 'confirmed', table: 'A1' },
        { id: 'amanda-bride', name: 'Amanda White', group: 'bride', rsvpStatus: 'pending', table: 'A2', plusOne: true },
        
        // Groom side
        { id: 'mike-groom', name: 'Mike Chen', group: 'groom', rsvpStatus: 'confirmed', table: 'B1', plusOne: true },
        { id: 'david-groom', name: 'David Lee', group: 'groom', rsvpStatus: 'confirmed', table: 'B1' },
        { id: 'james-groom', name: 'James Wilson', group: 'groom', rsvpStatus: 'pending', table: 'B2' },
        { id: 'robert-groom', name: 'Robert Garcia', group: 'groom', rsvpStatus: 'confirmed', table: 'B2', plusOne: true },
        { id: 'william-groom', name: 'William Martinez', group: 'groom', rsvpStatus: 'confirmed', table: 'B3' },
        { id: 'thomas-groom', name: 'Thomas Rodriguez', group: 'groom', rsvpStatus: 'declined', table: 'B3' },
        { id: 'daniel-groom', name: 'Daniel Kim', group: 'groom', rsvpStatus: 'confirmed', table: 'B1' },
        { id: 'kevin-groom', name: 'Kevin Park', group: 'groom', rsvpStatus: 'pending', table: 'B2', plusOne: true },
      ];

      const relationships: GuestLink[] = [
        // Bride side relationships
        { source: 'sarah-bride', target: 'emma-bride', relationship: 'best-friends' },
        { source: 'sarah-bride', target: 'jessica-bride', relationship: 'cousins' },
        { source: 'sarah-bride', target: 'megan-bride', relationship: 'sisters' },
        { source: 'emma-bride', target: 'rachel-bride', relationship: 'college-friends' },
        { source: 'megan-bride', target: 'ashley-bride', relationship: 'childhood-friends' },
        { source: 'jessica-bride', target: 'lisa-bride', relationship: 'work-colleagues' },
        { source: 'ashley-bride', target: 'rachel-bride', relationship: 'roommates' },
        { source: 'lisa-bride', target: 'amanda-bride', relationship: 'sisters' },
        { source: 'rachel-bride', target: 'amanda-bride', relationship: 'best-friends' },
        
        // Groom side relationships
        { source: 'mike-groom', target: 'david-groom', relationship: 'brothers' },
        { source: 'mike-groom', target: 'james-groom', relationship: 'best-friends' },
        { source: 'mike-groom', target: 'robert-groom', relationship: 'cousins' },
        { source: 'david-groom', target: 'william-groom', relationship: 'college-friends' },
        { source: 'david-groom', target: 'thomas-groom', relationship: 'childhood-friends' },
        { source: 'james-groom', target: 'daniel-groom', relationship: 'work-colleagues' },
        { source: 'robert-groom', target: 'kevin-groom', relationship: 'brothers' },
        { source: 'william-groom', target: 'thomas-groom', relationship: 'roommates' },
        { source: 'thomas-groom', target: 'daniel-groom', relationship: 'cousins' },
        { source: 'daniel-groom', target: 'kevin-groom', relationship: 'best-friends' },
        
        // Cross-side relationships
        { source: 'sarah-bride', target: 'mike-groom', relationship: 'engaged' },
        { source: 'emma-bride', target: 'david-groom', relationship: 'mutual-friends' },
        { source: 'megan-bride', target: 'robert-groom', relationship: 'family-friends' },
        { source: 'jessica-bride', target: 'william-groom', relationship: 'work-colleagues' },
      ];

      return { nodes: guests, links: relationships };
    };

    const data = generateFakeGuestData();
    setGraphData(data);
  }, []);

  // Custom node coloring based on group and RSVP status
  const getNodeColor = (node: GuestNode) => {
    const groupColors = {
      bride: '#ec4899', // pink
      groom: '#3b82f6', // blue
    };
    
    const statusOpacity = {
      confirmed: 1,
      pending: 0.7,
      declined: 0.4,
    };
    
    return groupColors[node.group] + Math.floor(statusOpacity[node.rsvpStatus] * 255).toString(16).padStart(2, '0');
  };

  // Custom link coloring based on relationship type
  const getLinkColor = (link: any) => {
    const relationshipColors = {
      'engaged': '#f59e0b', // amber
      'best-friends': '#10b981', // emerald
      'family-friends': '#8b5cf6', // violet
      'college-friends': '#06b6d4', // cyan
      'childhood-friends': '#f97316', // orange
      'work-colleagues': '#6366f1', // indigo
      'mutual-friends': '#84cc16', // lime
      'sisters': '#ec4899', // pink
      'brothers': '#3b82f6', // blue
      'cousins': '#a855f7', // purple
      'roommates': '#f59e0b', // amber
    };
    
    return relationshipColors[link.relationship as keyof typeof relationshipColors] || '#94a3b8'; // gray default
  };

  return (
    <div className="w-full h-full">
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        nodeLabel="name"
        nodeAutoColorBy="group"
        nodeCanvasObject={(node: GuestNode) => ({
          color: getNodeColor(node),
          size: node.plusOne ? 8 : 6,
          fontColor: '#ffffff',
          fontSize: 12,
          fontWeight: 'bold',
        })}
        linkColor={getLinkColor}
        linkWidth={2}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.004}
        linkDirectionalParticleWidth={2}
        enableNodeDrag={true}
        enableZoomInteraction={true}
        enablePanInteraction={true}
        cooldownTicks={20}
        d3AlphaDecay={0.0228}
        d3VelocityDecay={0.4}
        warmupTicks={100}
        onNodeClick={(node: any) => {
          alert(`Guest: ${node.name}\nGroup: ${node.group}\nRSVP: ${node.rsvpStatus}\nTable: ${node.table || 'Not assigned'}${node.plusOne ? '\nPlus One: Yes' : ''}`);
        }}
        onLinkClick={(link: any) => {
          alert(`Relationship: ${link.relationship}\n${link.source.name} ↔ ${link.target.name}`);
        }}
      />
      
      {/* Legend */}
      <div className="absolute top-4 left-4 bg-surface/90 backdrop-blur-sm border border-white/20 rounded-lg p-4 shadow-lg">
        <h3 className="text-sm font-semibold text-text-primary mb-3">Legend</h3>
        
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-pink-400 rounded-full"></div>
            <span className="text-text-secondary">Bride Side</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            <span className="text-text-secondary">Groom Side</span>
          </div>
          
          <div className="mt-2 pt-2 border-t border-white/10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-1 bg-amber-400"></div>
                <span className="text-text-secondary">Engaged</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-1 bg-emerald-400"></div>
                <span className="text-text-secondary">Best Friends</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-1 bg-purple-400"></div>
                <span className="text-text-secondary">Family Friends</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-1 bg-cyan-400"></div>
                <span className="text-text-secondary">College Friends</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Panel */}
      <div className="absolute top-4 right-4 bg-surface/90 backdrop-blur-sm border border-white/20 rounded-lg p-4 shadow-lg">
        <h3 className="text-sm font-semibold text-text-primary mb-3">Statistics</h3>
        
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-text-secondary">Total Guests:</span>
            <span className="font-medium text-text-primary">{graphData.nodes.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Bride Side:</span>
            <span className="font-medium text-pink-400">
              {graphData.nodes.filter(n => n.group === 'bride').length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Groom Side:</span>
            <span className="font-medium text-blue-400">
              {graphData.nodes.filter(n => n.group === 'groom').length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Confirmed:</span>
            <span className="font-medium text-green-400">
              {graphData.nodes.filter(n => n.rsvpStatus === 'confirmed').length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">With Plus One:</span>
            <span className="font-medium text-amber-400">
              {graphData.nodes.filter(n => n.plusOne).length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Relationships:</span>
            <span className="font-medium text-text-primary">{graphData.links.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
