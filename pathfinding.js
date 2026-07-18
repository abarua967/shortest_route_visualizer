
/**
 * Dijkstra's Algorithm Implementation
 */

class PathfindingEngine {
    constructor() {
        this.nodes = [];
        this.gridSize = 9;
        this.spacing = 60;
    }
    initializeNodes() {
        this.nodes = [];
        for (let i = 0; i < 80; i++) {
            const row = Math.floor(i / this.gridSize);
            const col = i % this.gridSize;
            
            this.nodes.push({
                id: i,
                x: 100 + col * this.spacing,
                y: 100 + row * this.spacing,
                connections: [],
                blocked: false
            });
        }
        
        // Create connections (roads between adjacent nodes)
        this.nodes.forEach((node, index) => {
    const row = Math.floor(index / this.gridSize);
    const col = index % this.gridSize;
    
    // Helper function to create mutual, safe connections
    const connect = (idA, idB) => {
        if (idB >= 0 && idB < 80) {
            if (!this.nodes[idA].connections.includes(idB)) this.nodes[idA].connections.push(idB);
            if (!this.nodes[idB].connections.includes(idA)) this.nodes[idB].connections.push(idA);
        }
    };

    // 1. Connect Straight Neighbors (Right and Bottom handles all pairs sequentially)
    if (col < this.gridSize - 1) {
        connect(index, index + 1);
    }
    if (index + this.gridSize < 80) {
        connect(index, index + this.gridSize);
    }
    
    // 2. Add Diagonal Connections (Mutually linked)
    if (Math.random() > 0.7) {
        // Diagonal Bottom-Right
        if (row < Math.floor(80 / this.gridSize) - 1 && col < this.gridSize - 1) {
            connect(index, index + this.gridSize + 1);
        }
        // Diagonal Bottom-Left
        if (row < Math.floor(80 / this.gridSize) - 1 && col > 0) {
            connect(index, index + this.gridSize - 1);
        }
    }
});
    }

    // Dijkstra's algorithm implementation
    dijkstra(start, end){
        const distances = new Array(this.nodes.length).fill(Infinity);
        const previous = new Array(this.nodes.length).fill(null);
        const visited = new Array(this.nodes.length).fill(false);
        
        distances[start] = 0;
        
        for (let i = 0; i < this.nodes.length; i++) {
            // Find unvisited node with minimum distance
            let minDistance = Infinity;
            let minNode = -1;
            
            for (let j = 0; j < this.nodes.length; j++) {
                if (!visited[j] && distances[j] < minDistance) {
                    minDistance = distances[j];
                    minNode = j;
                }
            }
            
            if (minNode === -1) break;
            
            visited[minNode] = true;
            
            // Update distances to neighbors
            const currentNode = this.nodes[minNode];
            if (currentNode && !currentNode.blocked) {
                currentNode.connections.forEach(neighborId => {
                    // Check if neighbor exists and is valid
                    if (neighborId >= 0 && neighborId < this.nodes.length && !visited[neighborId]) {
                        const neighbor = this.nodes[neighborId];
                        if (neighbor && !neighbor.blocked) {
                            const distance = Math.sqrt(
                                Math.pow(currentNode.x - neighbor.x, 2) + 
                                Math.pow(currentNode.y - neighbor.y, 2)
                            );
                            const newDistance = distances[minNode] + distance;
                            
                            if (newDistance < distances[neighborId]) {
                                distances[neighborId] = newDistance;
                                previous[neighborId] = minNode;
                            }
                        }
                    }
                });
            }
        }
        
        // Reconstruct path
        const path = [];
        let current = end;
        while (current !== null) {
            path.unshift(current);
            current = previous[current];
        }
        
        return {
            distances: distances,
            previous: previous,
            path: distances[end] === Infinity ? [] : path,
            totalDistance: distances[end]
        };
    }

    // Calculate euclidean distance between two nodes
    calculateDistance(nodeA, nodeB) {
        return Math.sqrt(
            Math.pow(nodeA.x - nodeB.x, 2) + 
            Math.pow(nodeA.y - nodeB.y, 2)
        );
    }

    // Block or unblock a node (for dynamic rerouting)
    toggleNodeBlock(nodeId) {
        if (nodeId >= 0 && nodeId < this.nodes.length) {
            this.nodes[nodeId].blocked = !this.nodes[nodeId].blocked;
        }
    }

    // Check if a node is blocked
    isNodeBlocked(nodeId){
        return nodeId >= 0 && nodeId < this.nodes.length && this.nodes[nodeId].blocked;
    }

    // Get node by ID
    getNode(nodeId) {
        return nodeId >= 0 && nodeId < this.nodes.length ? this.nodes[nodeId] : null;
    }

    // Get all nodes
    getAllNodes() {
        return this.nodes;
    }
}

// Export for use in main application
window.PathfindingEngine = PathfindingEngine;
