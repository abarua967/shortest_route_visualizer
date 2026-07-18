
/**
 * Main Application Logic
 * Handles UI interactions, canvas rendering, and animation
 */
$(document).ready(function(){
    // Initialize pathfinding engine
    const engine = new PathfindingEngine();
    engine.initializeNodes();
    
    // Application state
    let source = null;
    let destination = null;
    let currentPath = [];
    let carPosition = null;
    let isAnimating = false;
    let currentStep = 0;
    let totalDistance = 0;
    let blockedNodes = new Set();
    let animationFrame = null;
    
    // Canvas reference
    const canvas = document.getElementById('routeCanvas');
    const ctx = canvas.getContext('2d');
    
    // UI elements
    const $sourceDisplay = $('#sourceDisplay');
    const $destinationDisplay = $('#destinationDisplay');
    const $distanceDisplay = $('#distanceDisplay');
    const $statusDisplay = $('#statusDisplay');
    const $startBtn = $('#startBtn');
    const $stopBtn = $('#stopBtn');
    const $resetBtn = $('#resetBtn');
    
    // Update UI displays
    function updateDisplays(){
        $sourceDisplay.text(source !== null ? `Node ${source}` : 'Not set');
        $destinationDisplay.text(destination !== null ? `Node ${destination}` : 'Not set');
        $distanceDisplay.text(totalDistance > 0 ? `${Math.round(totalDistance)}px` : '-');
        
        // Update button states
        $startBtn.prop('disabled', currentPath.length === 0 || isAnimating);
        $stopBtn.prop('disabled', !isAnimating);
    }
    
    // Update algorithm status
    function setStatus(status) {
        $statusDisplay.text(status);
        console.log('Status:', status);
    }
    
    // Calculate path using Dijkstra's algorithm
    function calculatePath() {
        if (source === null || destination === null) return;
        
        setStatus('Calculating optimal route...');
        setTimeout(() => {
            const result = engine.dijkstra(source, destination);
            currentPath = result.path;
            totalDistance = result.totalDistance;
            
            setStatus(result.path.length > 0 ? 'Route calculated' : 'No route available');
            updateDisplays();
            drawCanvas();
        }, 1000);
    }
    
    // Start animation
    function startAnimation(){
        if (currentPath.length === 0) return;
        
        isAnimating = true;
        currentStep = 0;
        setStatus('Vehicle en route...');
        const startNode = engine.getNode(currentPath[0]);
        if (startNode) {
            carPosition = { x: startNode.x, y: startNode.y, angle: 0 };
        }
        updateDisplays();
        animateStep();
    }
    
    // Stop animation
    function stopAnimation() {
        isAnimating = false;
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }
        setStatus('Animation stopped');
        updateDisplays();
    }
    
    // Reset simulation
    function resetSimulation() {
        source = null;
        destination = null;
        currentPath = [];
        carPosition = null;
        isAnimating = false;
        currentStep = 0;
        totalDistance = 0;
        blockedNodes.clear();
        
        // Reset all nodes
        engine.getAllNodes().forEach(node => {
            node.blocked = false;
        });
        
        setStatus('Ready');
        updateDisplays();
        drawCanvas();
    }
    
    // Animation step function
    function animateStep(){
        if (!isAnimating || currentStep >= currentPath.length - 1) {
            if (currentStep >= currentPath.length - 1) {
                setStatus('Destination reached!');
                isAnimating = false;
                updateDisplays();
            }
            return;
        }
        
        const fromNode = engine.getNode(currentPath[currentStep]);
        const toNode = engine.getNode(currentPath[currentStep + 1]);
        
        if (!fromNode || !toNode) {
            stopAnimation();
            return;
        }
        
        // Check for blocked node ahead
        if(engine.isNodeBlocked(currentPath[currentStep + 1])) {
            setStatus('Obstacle detected! Rerouting...');
            isAnimating = false;
            
            setTimeout(() => {
                const currentNodeId = currentPath[currentStep];
                const result = engine.dijkstra(currentNodeId, destination);
                
                if (result.path.length > 0) {
                    currentPath = result.path;
                    currentStep = 0;
                    totalDistance = result.totalDistance;
                    isAnimating = true;
                    setStatus('New route calculated - resuming...');
                    updateDisplays();
                    animateStep();
                } else {
                    setStatus('No alternative route available');
                    updateDisplays();
                }
            }, 1000);
            return;
        }
        const startTime = Date.now();
        const duration = 1000; // 1 second per step
        
        function animate() {
            const elapsed = Date.now()-startTime;
            const progress = Math.min(elapsed / duration, 1);
            const x = fromNode.x + (toNode.x - fromNode.x) * progress;
            const y = fromNode.y + (toNode.y - fromNode.y) * progress;
            const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
            carPosition = { x, y, angle };
            drawCanvas();
            
            if (progress < 1 && isAnimating) {
                animationFrame = requestAnimationFrame(animate);
            } else if (isAnimating) {
                currentStep++;
                animateStep();
            }
        }
        
        animate();
    }
    
    // Canvas drawing function
    function drawCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const nodes = engine.getAllNodes();
        
        // Draw connections (roads)
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 2;
        nodes.forEach(node => {
            node.connections.forEach(connId => {
                const conn = engine.getNode(connId);
                if (conn) {
                    ctx.beginPath();
                    ctx.moveTo(node.x, node.y);
                    ctx.lineTo(conn.x, conn.y);
                    ctx.stroke();
                }
            });
        });
        
        // Draw path
        if (currentPath.length > 1) {
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 4;
            ctx.beginPath();
            for (let i = 0; i < currentPath.length - 1; i++) {
                const fromNode = engine.getNode(currentPath[i]);
                const toNode = engine.getNode(currentPath[i + 1]);
                if (fromNode && toNode) {
                    if (i === 0) {
                        ctx.moveTo(fromNode.x, fromNode.y);
                    }
                    ctx.lineTo(toNode.x, toNode.y);
                }
            }
            ctx.stroke();
        }
        
        // Draw nodes
        nodes.forEach(node => {
            ctx.beginPath();
            ctx.arc(node.x, node.y, 6, 0, 2 * Math.PI);
            
            if (node.blocked) {
                ctx.fillStyle = '#ef4444';
            } else if (node.id === source) {
                ctx.fillStyle = '#3b82f6';
            } else if (node.id === destination) {
                ctx.fillStyle = '#f59e0b';
            } else {
                ctx.fillStyle = '#6b7280';
            }
            
            ctx.fill();
            ctx.strokeStyle = '#1f2937';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw node numbers
            ctx.fillStyle = '#ffffff';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(node.id.toString(), node.x, node.y + 3);
        });
        
        // Draw car
        if (carPosition) {
            ctx.save();
            ctx.translate(carPosition.x, carPosition.y);
            ctx.rotate(carPosition.angle);
            
            // Car body
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(-8, -4, 16, 8);
            
            // Car details
            ctx.fillStyle = '#1f2937';
            ctx.fillRect(-6, -2, 4, 4);
            ctx.fillRect(2, -2, 4, 4);
            
            ctx.restore();
        }
    }
    
    // Canvas click handler
    $('#routeCanvas').on('click', function(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Find clicked node
        const nodes = engine.getAllNodes();
        const clickedNode = nodes.find(node => {
            const distance = Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2));
            return distance <= 10;
        });
        
        if (clickedNode) {
            if (e.shiftKey) {
                // Block/unblock node
                engine.toggleNodeBlock(clickedNode.id);
                if (source !== null && destination !== null) {
                    calculatePath();
                }
            } else if (source === null) {
                source = clickedNode.id;
            } else if (destination === null) {
                destination = clickedNode.id;
            } else {
                source = clickedNode.id;
                destination = null;
                currentPath = [];
                totalDistance = 0;
            }
            
            updateDisplays();
            drawCanvas();
            
            // Auto-calculate path when both source and destination are set
            if (source !== null && destination !== null) {
                calculatePath();
            }
        }
    });
    
    // Button event handlers
    $startBtn.on('click', startAnimation);
    $stopBtn.on('click', stopAnimation);
    $resetBtn.on('click', resetSimulation);
    
    // Initial setup
    updateDisplays();
    drawCanvas();
    setStatus('Ready');
    
    console.log('Smart Route Visualizer initialized with', engine.getAllNodes().length, 'nodes');
});