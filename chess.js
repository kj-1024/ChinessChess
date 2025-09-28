class ChineseChess {
    constructor() {
        this.canvas = document.getElementById('chess-board');
        this.ctx = this.canvas.getContext('2d');
        this.cellSize = 50;
        this.boardWidth = 9;
        this.boardHeight = 10;
        this.selectedPiece = null;
        this.selectedPos = null;
        this.currentPlayer = 'red'; // 红方先走
        this.gameOver = false;
        this.difficulty = 'beginner';
        this.moveHistory = [];
        
        // 棋盘状态：0=空, 正数=红方, 负数=黑方
        this.board = this.initializeBoard();
        
        // 棋子类型定义
        this.pieceTypes = {
            1: '兵', 2: '炮', 3: '车', 4: '马', 5: '象', 6: '士', 7: '帅',
            '-1': '卒', '-2': '炮', '-3': '车', '-4': '马', '-5': '象', '-6': '士', '-7': '将'
        };
        
        this.init();
    }
    
    initializeBoard() {
        const board = Array(10).fill().map(() => Array(9).fill(0));
        
        // 黑方棋子 (负数)
        board[0] = [-3, -4, -5, -6, -7, -6, -5, -4, -3]; // 后排
        board[2] = [0, -2, 0, 0, 0, 0, 0, -2, 0]; // 炮
        board[3] = [-1, 0, -1, 0, -1, 0, -1, 0, -1]; // 卒
        
        // 红方棋子 (正数)
        board[6] = [1, 0, 1, 0, 1, 0, 1, 0, 1]; // 兵
        board[7] = [0, 2, 0, 0, 0, 0, 0, 2, 0]; // 炮
        board[9] = [3, 4, 5, 6, 7, 6, 5, 4, 3]; // 后排
        
        return board;
    }
    
    init() {
        this.drawBoard();
        this.drawPieces();
        this.bindEvents();
        this.updateGameStatus();
    }
    
    bindEvents() {
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        document.getElementById('new-game').addEventListener('click', () => this.newGame());
        document.getElementById('undo').addEventListener('click', () => this.undoMove());
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.difficulty = e.target.value;
        });
    }
    
    drawBoard() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制棋盘背景
        this.ctx.fillStyle = '#f4e4bc';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制网格线
        this.ctx.strokeStyle = '#8b4513';
        this.ctx.lineWidth = 2;
        
        // 横线
        for (let i = 0; i <= this.boardHeight; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(35, 35 + i * this.cellSize);
            this.ctx.lineTo(35 + 8 * this.cellSize, 35 + i * this.cellSize);
            this.ctx.stroke();
        }
        
        // 竖线
        for (let i = 0; i <= this.boardWidth - 1; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(35 + i * this.cellSize, 35);
            if (i === 0 || i === 8) {
                // 边线贯通
                this.ctx.lineTo(35 + i * this.cellSize, 35 + 9 * this.cellSize);
            } else {
                // 中间线分段
                this.ctx.lineTo(35 + i * this.cellSize, 35 + 4 * this.cellSize);
                this.ctx.moveTo(35 + i * this.cellSize, 35 + 5 * this.cellSize);
                this.ctx.lineTo(35 + i * this.cellSize, 35 + 9 * this.cellSize);
            }
            this.ctx.stroke();
        }
        
        // 绘制楚河汉界
        this.ctx.fillStyle = '#8b4513';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('楚河', 135, 255);
        this.ctx.fillText('汉界', 335, 255);
        
        // 绘制九宫格对角线
        this.drawPalaceDiagonals();
        
        // 绘制炮和兵的标记点
        this.drawPositionMarks();
    }
    
    drawPalaceDiagonals() {
        this.ctx.strokeStyle = '#8b4513';
        this.ctx.lineWidth = 2;
        
        // 上方九宫格
        this.ctx.beginPath();
        this.ctx.moveTo(35 + 3 * this.cellSize, 35);
        this.ctx.lineTo(35 + 5 * this.cellSize, 35 + 2 * this.cellSize);
        this.ctx.moveTo(35 + 5 * this.cellSize, 35);
        this.ctx.lineTo(35 + 3 * this.cellSize, 35 + 2 * this.cellSize);
        this.ctx.stroke();
        
        // 下方九宫格
        this.ctx.beginPath();
        this.ctx.moveTo(35 + 3 * this.cellSize, 35 + 7 * this.cellSize);
        this.ctx.lineTo(35 + 5 * this.cellSize, 35 + 9 * this.cellSize);
        this.ctx.moveTo(35 + 5 * this.cellSize, 35 + 7 * this.cellSize);
        this.ctx.lineTo(35 + 3 * this.cellSize, 35 + 9 * this.cellSize);
        this.ctx.stroke();
    }
    
    drawPositionMarks() {
        const markPositions = [
            [1, 2], [7, 2], [0, 3], [2, 3], [4, 3], [6, 3], [8, 3],
            [0, 6], [2, 6], [4, 6], [6, 6], [8, 6], [1, 7], [7, 7]
        ];
        
        this.ctx.strokeStyle = '#8b4513';
        this.ctx.lineWidth = 1;
        
        markPositions.forEach(([x, y]) => {
            const centerX = 35 + x * this.cellSize;
            const centerY = 35 + y * this.cellSize;
            const size = 4;
            
            // 绘制小十字标记
            this.ctx.beginPath();
            this.ctx.moveTo(centerX - size, centerY - size);
            this.ctx.lineTo(centerX - size + 2, centerY - size);
            this.ctx.moveTo(centerX - size, centerY - size);
            this.ctx.lineTo(centerX - size, centerY - size + 2);
            
            this.ctx.moveTo(centerX + size, centerY - size);
            this.ctx.lineTo(centerX + size - 2, centerY - size);
            this.ctx.moveTo(centerX + size, centerY - size);
            this.ctx.lineTo(centerX + size, centerY - size + 2);
            
            this.ctx.moveTo(centerX - size, centerY + size);
            this.ctx.lineTo(centerX - size + 2, centerY + size);
            this.ctx.moveTo(centerX - size, centerY + size);
            this.ctx.lineTo(centerX - size, centerY + size - 2);
            
            this.ctx.moveTo(centerX + size, centerY + size);
            this.ctx.lineTo(centerX + size - 2, centerY + size);
            this.ctx.moveTo(centerX + size, centerY + size);
            this.ctx.lineTo(centerX + size, centerY + size - 2);
            
            this.ctx.stroke();
        });
    }
    
    drawPieces() {
        for (let y = 0; y < this.boardHeight; y++) {
            for (let x = 0; x < this.boardWidth; x++) {
                const piece = this.board[y][x];
                if (piece !== 0) {
                    this.drawPiece(x, y, piece);
                }
            }
        }
        
        // 高亮选中的棋子
        if (this.selectedPos) {
            this.highlightPosition(this.selectedPos.x, this.selectedPos.y, '#ffff00');
        }
    }
    
    drawPiece(x, y, piece) {
        const centerX = 35 + x * this.cellSize;
        const centerY = 35 + y * this.cellSize;
        const radius = 20;
        
        // 绘制棋子圆形
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = piece > 0 ? '#ff6b6b' : '#4a4a4a';
        this.ctx.fill();
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // 绘制棋子文字
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(this.pieceTypes[piece], centerX, centerY);
    }
    
    highlightPosition(x, y, color) {
        const centerX = 35 + x * this.cellSize;
        const centerY = 35 + y * this.cellSize;
        
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 22, 0, 2 * Math.PI);
        this.ctx.stroke();
    }
    
    handleClick(e) {
        if (this.gameOver || this.currentPlayer === 'black') return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.round((e.clientX - rect.left - 35) / this.cellSize);
        const y = Math.round((e.clientY - rect.top - 35) / this.cellSize);
        
        if (x < 0 || x >= this.boardWidth || y < 0 || y >= this.boardHeight) return;
        
        const piece = this.board[y][x];
        
        if (this.selectedPiece === null) {
            // 选择棋子
            if (piece > 0) { // 只能选择红方棋子
                this.selectedPiece = piece;
                this.selectedPos = {x, y};
                this.drawBoard();
                this.drawPieces();
            }
        } else {
            // 移动棋子
            if (this.isValidMove(this.selectedPos.x, this.selectedPos.y, x, y)) {
                this.makeMove(this.selectedPos.x, this.selectedPos.y, x, y);
                this.selectedPiece = null;
                this.selectedPos = null;
                
                if (!this.gameOver) {
                    // 电脑走棋
                    setTimeout(() => this.aiMove(), 500);
                }
            } else {
                // 重新选择棋子
                if (piece > 0) {
                    this.selectedPiece = piece;
                    this.selectedPos = {x, y};
                } else {
                    this.selectedPiece = null;
                    this.selectedPos = null;
                }
                this.drawBoard();
                this.drawPieces();
            }
        }
    }
    
    isValidMove(fromX, fromY, toX, toY) {
        const piece = this.board[fromY][fromX];
        const targetPiece = this.board[toY][toX];
        
        // 不能吃自己的棋子
        if (piece > 0 && targetPiece > 0) return false;
        if (piece < 0 && targetPiece < 0) return false;
        
        const pieceType = Math.abs(piece);
        
        switch (pieceType) {
            case 1: return this.isValidPawnMove(fromX, fromY, toX, toY, piece > 0);
            case 2: return this.isValidCannonMove(fromX, fromY, toX, toY);
            case 3: return this.isValidRookMove(fromX, fromY, toX, toY);
            case 4: return this.isValidHorseMove(fromX, fromY, toX, toY);
            case 5: return this.isValidElephantMove(fromX, fromY, toX, toY, piece > 0);
            case 6: return this.isValidAdvisorMove(fromX, fromY, toX, toY, piece > 0);
            case 7: return this.isValidKingMove(fromX, fromY, toX, toY, piece > 0);
        }
        
        return false;
    }
    
    isValidPawnMove(fromX, fromY, toX, toY, isRed) {
        const dx = toX - fromX;
        const dy = toY - fromY;
        
        if (isRed) {
            // 红兵：只能向前走，过河后可以横走
            if (fromY > 4) { // 未过河
                return dx === 0 && dy === -1;
            } else { // 已过河
                return (dx === 0 && dy === -1) || (Math.abs(dx) === 1 && dy === 0);
            }
        } else {
            // 黑卒：只能向前走，过河后可以横走
            if (fromY < 5) { // 未过河
                return dx === 0 && dy === 1;
            } else { // 已过河
                return (dx === 0 && dy === 1) || (Math.abs(dx) === 1 && dy === 0);
            }
        }
    }
    
    isValidCannonMove(fromX, fromY, toX, toY) {
        if (fromX !== toX && fromY !== toY) return false;
        
        const targetPiece = this.board[toY][toX];
        let pieceCount = 0;
        
        if (fromX === toX) {
            // 垂直移动
            const start = Math.min(fromY, toY) + 1;
            const end = Math.max(fromY, toY);
            for (let y = start; y < end; y++) {
                if (this.board[y][fromX] !== 0) pieceCount++;
            }
        } else {
            // 水平移动
            const start = Math.min(fromX, toX) + 1;
            const end = Math.max(fromX, toX);
            for (let x = start; x < end; x++) {
                if (this.board[fromY][x] !== 0) pieceCount++;
            }
        }
        
        if (targetPiece === 0) {
            // 移动到空位，中间不能有棋子
            return pieceCount === 0;
        } else {
            // 吃子，中间必须有一个棋子
            return pieceCount === 1;
        }
    }
    
    isValidRookMove(fromX, fromY, toX, toY) {
        if (fromX !== toX && fromY !== toY) return false;
        
        if (fromX === toX) {
            // 垂直移动
            const start = Math.min(fromY, toY) + 1;
            const end = Math.max(fromY, toY);
            for (let y = start; y < end; y++) {
                if (this.board[y][fromX] !== 0) return false;
            }
        } else {
            // 水平移动
            const start = Math.min(fromX, toX) + 1;
            const end = Math.max(fromX, toX);
            for (let x = start; x < end; x++) {
                if (this.board[fromY][x] !== 0) return false;
            }
        }
        
        return true;
    }
    
    isValidHorseMove(fromX, fromY, toX, toY) {
        const dx = Math.abs(toX - fromX);
        const dy = Math.abs(toY - fromY);
        
        if (!((dx === 2 && dy === 1) || (dx === 1 && dy === 2))) return false;
        
        // 检查马腿
        let blockX, blockY;
        if (dx === 2) {
            blockX = fromX + (toX > fromX ? 1 : -1);
            blockY = fromY;
        } else {
            blockX = fromX;
            blockY = fromY + (toY > fromY ? 1 : -1);
        }
        
        return this.board[blockY][blockX] === 0;
    }
    
    isValidElephantMove(fromX, fromY, toX, toY, isRed) {
        const dx = Math.abs(toX - fromX);
        const dy = Math.abs(toY - fromY);
        
        if (dx !== 2 || dy !== 2) return false;
        
        // 不能过河
        if (isRed && toY < 5) return false;
        if (!isRed && toY > 4) return false;
        
        // 检查象眼
        const blockX = fromX + (toX > fromX ? 1 : -1);
        const blockY = fromY + (toY > fromY ? 1 : -1);
        
        return this.board[blockY][blockX] === 0;
    }
    
    isValidAdvisorMove(fromX, fromY, toX, toY, isRed) {
        const dx = Math.abs(toX - fromX);
        const dy = Math.abs(toY - fromY);
        
        if (dx !== 1 || dy !== 1) return false;
        
        // 只能在九宫格内
        if (toX < 3 || toX > 5) return false;
        if (isRed && (toY < 7 || toY > 9)) return false;
        if (!isRed && (toY < 0 || toY > 2)) return false;
        
        return true;
    }
    
    isValidKingMove(fromX, fromY, toX, toY, isRed) {
        const dx = Math.abs(toX - fromX);
        const dy = Math.abs(toY - fromY);
        
        // 基本移动规则
        if (!((dx === 1 && dy === 0) || (dx === 0 && dy === 1))) {
            // 检查是否为飞将
            if (fromX === toX && this.board[toY][toX] !== 0) {
                const targetPiece = Math.abs(this.board[toY][toX]);
                if (targetPiece === 7) { // 对方也是将/帅
                    // 检查中间是否有棋子
                    const start = Math.min(fromY, toY) + 1;
                    const end = Math.max(fromY, toY);
                    for (let y = start; y < end; y++) {
                        if (this.board[y][fromX] !== 0) return false;
                    }
                    return true;
                }
            }
            return false;
        }
        
        // 只能在九宫格内
        if (toX < 3 || toX > 5) return false;
        if (isRed && (toY < 7 || toY > 9)) return false;
        if (!isRed && (toY < 0 || toY > 2)) return false;
        
        return true;
    }
    
    makeMove(fromX, fromY, toX, toY) {
        const piece = this.board[fromY][fromX];
        const capturedPiece = this.board[toY][toX];
        
        // 保存移动历史
        this.moveHistory.push({
            from: {x: fromX, y: fromY},
            to: {x: toX, y: toY},
            piece: piece,
            capturedPiece: capturedPiece
        });
        
        // 执行移动
        this.board[toY][toX] = piece;
        this.board[fromY][fromX] = 0;
        
        // 添加被吃棋子到俘获区域
        if (capturedPiece !== 0) {
            this.addCapturedPiece(capturedPiece);
        }
        
        // 检查游戏结束
        if (this.isGameOver()) {
            this.gameOver = true;
            this.showGameResult();
        } else {
            this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
            this.updateGameStatus();
        }
        
        this.drawBoard();
        this.drawPieces();
    }
    
    addCapturedPiece(piece) {
        const container = piece > 0 ? 
            document.getElementById('red-captured') : 
            document.getElementById('black-captured');
        
        const pieceElement = document.createElement('div');
        pieceElement.className = `captured-piece ${piece > 0 ? 'red' : 'black'}`;
        pieceElement.textContent = this.pieceTypes[piece];
        container.appendChild(pieceElement);
    }
    
    isGameOver() {
        // 检查是否有将/帅被吃
        let redKingExists = false;
        let blackKingExists = false;
        
        for (let y = 0; y < this.boardHeight; y++) {
            for (let x = 0; x < this.boardWidth; x++) {
                const piece = this.board[y][x];
                if (piece === 7) redKingExists = true;
                if (piece === -7) blackKingExists = true;
            }
        }
        
        return !redKingExists || !blackKingExists;
    }
    
    showGameResult() {
        let winner = '';
        if (!this.findKing('red')) {
            winner = '黑方获胜！';
        } else if (!this.findKing('black')) {
            winner = '红方获胜！';
        }
        
        document.getElementById('game-message').textContent = winner;
        document.getElementById('current-turn').textContent = '游戏结束';
    }
    
    findKing(color) {
        const kingValue = color === 'red' ? 7 : -7;
        for (let y = 0; y < this.boardHeight; y++) {
            for (let x = 0; x < this.boardWidth; x++) {
                if (this.board[y][x] === kingValue) {
                    return {x, y};
                }
            }
        }
        return null;
    }
    
    updateGameStatus() {
        const turnText = this.currentPlayer === 'red' ? '红方走棋' : '黑方走棋';
        document.getElementById('current-turn').textContent = turnText;
        document.getElementById('game-message').textContent = '';
    }
    
    newGame() {
        this.board = this.initializeBoard();
        this.selectedPiece = null;
        this.selectedPos = null;
        this.currentPlayer = 'red';
        this.gameOver = false;
        this.moveHistory = [];
        
        // 清空俘获区域
        document.getElementById('red-captured').innerHTML = '';
        document.getElementById('black-captured').innerHTML = '';
        
        this.drawBoard();
        this.drawPieces();
        this.updateGameStatus();
    }
    
    undoMove() {
        if (this.moveHistory.length === 0) return;
        
        const lastMove = this.moveHistory.pop();
        
        // 恢复棋子位置
        this.board[lastMove.from.y][lastMove.from.x] = lastMove.piece;
        this.board[lastMove.to.y][lastMove.to.x] = lastMove.capturedPiece;
        
        // 从俘获区域移除最后一个棋子
        if (lastMove.capturedPiece !== 0) {
            const container = lastMove.capturedPiece > 0 ? 
                document.getElementById('red-captured') : 
                document.getElementById('black-captured');
            if (container.lastChild) {
                container.removeChild(container.lastChild);
            }
        }
        
        this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
        this.gameOver = false;
        
        this.drawBoard();
        this.drawPieces();
        this.updateGameStatus();
    }
    
    // AI相关方法
    aiMove() {
        if (this.gameOver || this.currentPlayer !== 'black') return;
        
        let bestMove;
        
        switch (this.difficulty) {
            case 'beginner':
                bestMove = this.getRandomMove();
                break;
            case 'intermediate':
                bestMove = this.getIntermediateMove();
                break;
            case 'hell':
                bestMove = this.getHellMove();
                break;
        }
        
        if (bestMove) {
            this.makeMove(bestMove.from.x, bestMove.from.y, bestMove.to.x, bestMove.to.y);
        }
    }
    
    getRandomMove() {
        const moves = this.getAllValidMoves('black');
        if (moves.length === 0) return null;
        
        return moves[Math.floor(Math.random() * moves.length)];
    }
    
    getIntermediateMove() {
        const moves = this.getAllValidMoves('black');
        if (moves.length === 0) return null;
        
        // 简单评估：优先吃子，其次威胁对方
        let bestMove = null;
        let bestScore = -Infinity;
        
        for (const move of moves) {
            let score = 0;
            
            // 吃子得分
            const capturedPiece = this.board[move.to.y][move.to.x];
            if (capturedPiece > 0) {
                score += this.getPieceValue(Math.abs(capturedPiece)) * 10;
            }
            
            // 位置得分
            score += this.getPositionValue(move.to.x, move.to.y, this.board[move.from.y][move.from.x]);
            
            // 随机因子
            score += Math.random() * 50;
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        
        return bestMove;
    }
    
    getHellMove() {
        const moves = this.getAllValidMoves('black');
        if (moves.length === 0) return null;
        
        // 使用Minimax算法，深度为3
        let bestMove = null;
        let bestScore = -Infinity;
        
        for (const move of moves) {
            const score = this.minimax(move, 3, -Infinity, Infinity, false);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        
        return bestMove || moves[0];
    }
    
    minimax(move, depth, alpha, beta, isMaximizing) {
        // 执行移动
        const originalPiece = this.board[move.to.y][move.to.x];
        this.board[move.to.y][move.to.x] = this.board[move.from.y][move.from.x];
        this.board[move.from.y][move.from.x] = 0;
        
        let score;
        
        if (depth === 0 || this.isGameOver()) {
            score = this.evaluateBoard();
        } else {
            const moves = this.getAllValidMoves(isMaximizing ? 'black' : 'red');
            
            if (isMaximizing) {
                score = -Infinity;
                for (const nextMove of moves) {
                    score = Math.max(score, this.minimax(nextMove, depth - 1, alpha, beta, false));
                    alpha = Math.max(alpha, score);
                    if (beta <= alpha) break;
                }
            } else {
                score = Infinity;
                for (const nextMove of moves) {
                    score = Math.min(score, this.minimax(nextMove, depth - 1, alpha, beta, true));
                    beta = Math.min(beta, score);
                    if (beta <= alpha) break;
                }
            }
        }
        
        // 撤销移动
        this.board[move.from.y][move.from.x] = this.board[move.to.y][move.to.x];
        this.board[move.to.y][move.to.x] = originalPiece;
        
        return score;
    }
    
    evaluateBoard() {
        let score = 0;
        
        for (let y = 0; y < this.boardHeight; y++) {
            for (let x = 0; x < this.boardWidth; x++) {
                const piece = this.board[y][x];
                if (piece !== 0) {
                    const pieceValue = this.getPieceValue(Math.abs(piece));
                    const positionValue = this.getPositionValue(x, y, piece);
                    
                    if (piece > 0) {
                        score -= pieceValue + positionValue; // 红方
                    } else {
                        score += pieceValue + positionValue; // 黑方
                    }
                }
            }
        }
        
        return score;
    }
    
    getPieceValue(pieceType) {
        const values = {
            1: 100,  // 兵/卒
            2: 450,  // 炮
            3: 500,  // 车
            4: 300,  // 马
            5: 200,  // 象
            6: 200,  // 士
            7: 10000 // 帅/将
        };
        return values[pieceType] || 0;
    }
    
    getPositionValue(x, y, piece) {
        const pieceType = Math.abs(piece);
        const isRed = piece > 0;
        
        // 简单的位置评估
        let value = 0;
        
        // 中心控制
        if (x >= 3 && x <= 5) value += 10;
        
        // 兵/卒过河奖励
        if (pieceType === 1) {
            if (isRed && y <= 4) value += 50;
            if (!isRed && y >= 5) value += 50;
        }
        
        return value;
    }
    
    getAllValidMoves(color) {
        const moves = [];
        const isRed = color === 'red';
        
        for (let y = 0; y < this.boardHeight; y++) {
            for (let x = 0; x < this.boardWidth; x++) {
                const piece = this.board[y][x];
                if (piece === 0) continue;
                if ((piece > 0) !== isRed) continue;
                
                for (let toY = 0; toY < this.boardHeight; toY++) {
                    for (let toX = 0; toX < this.boardWidth; toX++) {
                        if (this.isValidMove(x, y, toX, toY)) {
                            moves.push({
                                from: {x, y},
                                to: {x: toX, y: toY}
                            });
                        }
                    }
                }
            }
        }
        
        return moves;
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new ChineseChess();
});