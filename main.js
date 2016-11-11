/// <reference path="./typings/index.d.ts" />
var Puzzle = (function () {
    function Puzzle() {
        this.W = 8;
        this.H = 12;
        this.COLOR = 5;
        this.board = [];
        this.classes = ["redCell", "greenCell", "blueCell", "yellowCell", "lightblueCell", "whiteCell"];
        this.selectedCell = [null, null];
        this.score = 0;
        this.dropFlag = false;
        // 盤面生成
        for (var i = 0; i < this.H; i++)
            this.board[i] = [];
        for (var i = 0; i < this.H; i++)
            for (var j = 0; j < this.W; j++)
                this.board[i][j] = Math.floor(Math.random() * this.COLOR);
        // 盤面表示
        var html = "", idx;
        for (var i = 0; i < this.H; i++) {
            html += "<tr>";
            for (var j = 0; j < this.W; j++) {
                idx = this.calcIndex([j, i]);
                html += "<td class=" + this.classes[this.board[i][j]] + " id=\"cell" + idx + "\"></td>";
            }
            html += "</tr>";
        }
        $("#main").html(html);
    }
    Puzzle.prototype.selectCell = function (idx) {
        // 選択状態のセルに隣接するセルを選択した
        if (this.isAdjacent(this.selectedCell, idx)) {
            this.swapCells(this.selectedCell, idx);
            // 選択状態解除
            $("#cell" + this.calcIndex(this.selectedCell)).removeClass("selectedCell");
            this.selectedCell = [null, null];
            // while (this.deleteCells())
            // this.dropCells();
            var self_1 = this;
            var loop_1 = function () {
                if (self_1.deleteCells()) {
                    self_1.dropFlag = true;
                    setTimeout(self_1.dropCells(), 500);
                    (function waitDropCells() {
                        if (self_1.dropFlag) {
                            setTimeout(waitDropCells, 100);
                            return;
                        }
                        setTimeout(loop_1, 100);
                    })();
                }
            };
            setTimeout(loop_1, 500);
            return;
        }
        // 選択状態のセルがない or 選択状態のセルと隣接しないセルを選択した
        var id = this.calcIndex(idx);
        $("#cell" + id).addClass("selectedCell");
        if (this.selectedCell[0] !== null)
            $("#cell" + this.calcIndex(this.selectedCell)).removeClass("selectedCell");
        this.selectedCell = idx;
        return;
    };
    Puzzle.prototype.swapCells = function (idx1, idx2) {
        var p = this.calcIndex(idx1), q = this.calcIndex(idx2);
        $("#cell" + p).switchClass(this.classes[this.board[idx1[1]][idx1[0]]], this.classes[this.board[idx2[1]][idx2[0]]], this.board[idx1[1]][idx1[0]] === this.COLOR ? 0 : 500);
        $("#cell" + q).switchClass(this.classes[this.board[idx2[1]][idx2[0]]], this.classes[this.board[idx1[1]][idx1[0]]], this.board[idx2[1]][idx2[0]] === this.COLOR ? 0 : 500);
        var tmp = this.board[idx1[1]][idx1[0]];
        this.board[idx1[1]][idx1[0]] = this.board[idx2[1]][idx2[0]];
        this.board[idx2[1]][idx2[0]] = tmp;
        return;
    };
    Puzzle.prototype.calcIndex = function (idx) {
        return idx[1] * this.W + idx[0];
    };
    Puzzle.prototype.isAdjacent = function (idx1, idx2) {
        if (idx1[0] === null || idx1[0] < 0 || idx1[0] >= this.W)
            return false;
        if (idx1[1] === null || idx1[1] < 0 || idx1[1] >= this.H)
            return false;
        if (idx2[0] === null || idx2[0] < 0 || idx2[0] >= this.W)
            return false;
        if (idx2[1] === null || idx2[1] < 0 || idx2[1] >= this.H)
            return false;
        if (idx1[0] === idx2[0] && (idx1[1] + 1 === idx2[1] || idx1[1] - 1 === idx2[1]))
            return true;
        if (idx1[1] === idx2[1] && (idx1[0] + 1 === idx2[0] || idx1[0] - 1 === idx2[0]))
            return true;
        return false;
    };
    Puzzle.prototype.findDeleteCells = function (board) {
        for (var i = 0; i < this.H; i++) {
            for (var j = 0; j < this.W; j++) {
                var cnt = 0;
                for (var k = i; k < this.H && this.board[i][j] === this.board[k][j] && cnt < 3; k++)
                    cnt++;
                if (cnt >= 3) {
                    for (var k = i; k < this.H && this.board[i][j] === this.board[k][j]; k++) {
                        board[k][j] = this.COLOR;
                    }
                }
                cnt = 0;
                for (var k = j; k < this.W && this.board[i][j] === this.board[i][k] && cnt < 3; k++)
                    cnt++;
                if (cnt >= 3) {
                    for (var k = j; k < this.W && this.board[i][j] === this.board[i][k]; k++) {
                        board[i][k] = this.COLOR;
                    }
                }
            }
        }
        return;
    };
    Puzzle.prototype.deleteCells = function () {
        var copiedBoard = [];
        for (var i = 0; i < this.H; i++)
            copiedBoard[i] = this.board[i].concat();
        this.findDeleteCells(copiedBoard);
        var res = false;
        for (var i = 0; i < this.H; i++) {
            for (var j = 0; j < this.W; j++) {
                if (this.board[i][j] !== copiedBoard[i][j]) {
                    var idx = this.calcIndex([j, i]);
                    $("#cell" + idx).switchClass(this.classes[this.board[i][j]], this.classes[this.COLOR], 500);
                    this.board[i][j] = this.COLOR;
                    this.score += 10;
                    res = true;
                }
            }
        }
        $("input").attr({
            value: this.score
        });
        return res;
    };
    Puzzle.prototype.dropCells = function () {
        var dropped = true;
        var self = this;
        var loop = function () {
            if (dropped) {
                dropped = false;
                for (var i = 0; i < self.W; i++) {
                    if (self.board[0][i] === self.COLOR) {
                        var idx = self.calcIndex([i, 0]);
                        self.board[0][i] = Math.floor(Math.random() * self.COLOR);
                        $("#cell" + idx).switchClass(self.classes[self.COLOR], self.classes[self.board[0][i]], 0);
                    }
                }
                for (var i = self.H - 1; i > 0; i--) {
                    for (var j = 0; j < self.W; j++) {
                        if (self.board[i][j] === self.COLOR && self.board[i - 1][j] !== self.COLOR) {
                            dropped = true;
                            self.swapCells([j, i], [j, i - 1]);
                        }
                    }
                }
                setTimeout(loop, 500);
                return;
            }
            self.dropFlag = false;
        };
        setTimeout(loop, 500);
        return;
    };
    return Puzzle;
}());
var puzzle = new Puzzle();
$("td").click(function () {
    var id = $(this).attr("id");
    var idx = +id.substr(4);
    var x = idx % puzzle.W, y = Math.floor(idx / puzzle.W);
    puzzle.selectCell([x, y]);
});
