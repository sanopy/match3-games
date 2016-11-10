/// <reference path="./typings/index.d.ts" />
var Puzzle = (function () {
    function Puzzle() {
        this.W = 8;
        this.H = 12;
        this.COLOR = 5;
        this.board = [];
        this.classes = ["redCell", "greenCell", "blueCell", "yellowCell", "lightblueCell", "whiteCell"];
        this.selectedCell = [null, null];
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
        if (this.isAdjacent(this.selectedCell, idx)) {
            this.swapCells(this.selectedCell, idx);
            // セレクト状態解除
            $("#cell" + this.calcIndex(this.selectedCell)).removeClass("selectedCell");
            this.selectedCell = [null, null];
            while (this.deleteCells())
                this.dropCells();
            return;
        }
        var id = this.calcIndex(idx);
        $("#cell" + id).addClass("selectedCell");
        if (this.selectedCell[0] !== null)
            $("#cell" + this.calcIndex(this.selectedCell)).removeClass("selectedCell");
        this.selectedCell = idx;
        return;
    };
    Puzzle.prototype.swapCells = function (idx1, idx2) {
        var p = this.calcIndex(idx1), q = this.calcIndex(idx2);
        $("#cell" + p).switchClass(this.classes[this.board[idx1[1]][idx1[0]]], this.classes[this.board[idx2[1]][idx2[0]]], 500);
        $("#cell" + q).switchClass(this.classes[this.board[idx2[1]][idx2[0]]], this.classes[this.board[idx1[1]][idx1[0]]], 500);
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
    Puzzle.prototype.deleteCells = function () {
        var res = false;
        for (var i = 0; i < this.H; i++) {
            for (var j = 0; j < this.W; j++) {
                if (this.board[i][j] !== this.COLOR) {
                    var cnt = 0;
                    for (var k = i; k < this.H && this.board[i][j] === this.board[k][j] && cnt < 3; k++)
                        cnt++;
                    if (cnt >= 3) {
                        for (var k = i + 1; k < this.H && this.board[i][j] === this.board[k][j]; k++) {
                            var idx_1 = this.calcIndex([j, k]);
                            $("#cell" + idx_1).switchClass(this.classes[this.board[k][j]], this.classes[this.COLOR], 1000);
                            this.board[k][j] = this.COLOR;
                        }
                        var idx = this.calcIndex([j, i]);
                        $("#cell" + idx).switchClass(this.classes[this.board[i][j]], this.classes[this.COLOR], 1000);
                        this.board[i][j] = this.COLOR;
                        res = true;
                    }
                    cnt = 0;
                    for (var k = j; k < this.W && this.board[i][j] === this.board[i][k] && cnt < 3; k++)
                        cnt++;
                    if (cnt >= 3) {
                        for (var k = j + 1; k < this.W && this.board[i][j] === this.board[i][k]; k++) {
                            var idx_2 = this.calcIndex([k, i]);
                            $("#cell" + idx_2).switchClass(this.classes[this.board[i][k]], this.classes[this.COLOR], 1000);
                            this.board[i][k] = this.COLOR;
                        }
                        var idx = this.calcIndex([j, i]);
                        $("#cell" + idx).switchClass(this.classes[this.board[i][j]], this.classes[this.COLOR], 1000);
                        this.board[i][j] = this.COLOR;
                        res = true;
                    }
                }
            }
        }
        return res;
    };
    Puzzle.prototype.dropCells = function () {
        var dropped = true;
        while (dropped) {
            dropped = false;
            for (var i = 0; i < this.W; i++) {
                if (this.board[0][i] === this.COLOR) {
                    var idx = this.calcIndex([i, 0]);
                    this.board[0][i] = Math.floor(Math.random() * this.COLOR);
                    $("#cell" + idx).switchClass(this.classes[this.COLOR], this.classes[this.board[0][i]], 500);
                }
            }
            for (var i = this.H - 1; i > 0; i--) {
                for (var j = 0; j < this.W; j++) {
                    if (this.board[i][j] === this.COLOR && this.board[i - 1][j] !== this.COLOR) {
                        dropped = true;
                        this.swapCells([j, i], [j, i - 1]);
                    }
                }
            }
        }
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
