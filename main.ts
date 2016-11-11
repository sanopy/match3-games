/// <reference path="./typings/index.d.ts" />

class Puzzle {
  public W = 8;
  public H = 12;
  public COLOR = 5;
  private board = [];
  private classes = ["redCell", "greenCell", "blueCell", "yellowCell", "lightblueCell", "whiteCell"];
  private selectedCell: [number, number] = [null, null];
  private score = 0;
  private dropFlag = false;

  constructor() {
    // 盤面生成
    for (let i = 0; i < this.H; i++)
      this.board[i] = [];

    for (let i = 0; i < this.H; i++)
      for (let j = 0; j < this.W; j++)
        this.board[i][j] = Math.floor(Math.random() * this.COLOR);

    // 盤面表示
    let html = "", idx: number;
    for (let i = 0; i < this.H; i++) {
      html += "<tr>";
      for (let j = 0; j < this.W; j++) {
        idx = this.calcIndex([j, i]);
        html += "<td class=" + this.classes[this.board[i][j]] + " id=\"cell" + idx + "\"></td>";
      }
      html += "</tr>";
    }
    $("#main").html(html);
  }

  public selectCell(idx: [number, number]): void {
    // 選択状態のセルに隣接するセルを選択した
    if (this.isAdjacent(this.selectedCell, idx)) {
      this.swapCells(this.selectedCell, idx);

      // 選択状態解除
      $("#cell" + this.calcIndex(this.selectedCell)).removeClass("selectedCell");
      this.selectedCell = [null, null];

      // while (this.deleteCells())
        // this.dropCells();
      let self = this;
      let loop = function() {
        if (self.deleteCells()) {
          self.dropFlag = true;
          setTimeout(self.dropCells(), 500);
          (function waitDropCells() {
            if (self.dropFlag) {
              setTimeout(waitDropCells, 100);
              return;
            }
            setTimeout(loop, 100);
          })();
          // setTimeout(loop, 500);
        }
      };
      setTimeout(loop, 500);

      return;
    }

    // 選択状態のセルがない or 選択状態のセルと隣接しないセルを選択した
    let id = this.calcIndex(idx);
    $("#cell" + id).addClass("selectedCell");
    if (this.selectedCell[0] !== null)
      $("#cell" + this.calcIndex(this.selectedCell)).removeClass("selectedCell");
    this.selectedCell = idx;
    return;
  }

  private swapCells(idx1: [number, number], idx2: [number, number]): void {
    let p = this.calcIndex(idx1), q = this.calcIndex(idx2);

    $("#cell" + p).switchClass(this.classes[ this.board[idx1[1]][idx1[0]] ], this.classes[ this.board[idx2[1]][idx2[0]] ],
      this.board[idx1[1]][idx1[0]] === this.COLOR ? 0 : 500);
    $("#cell" + q).switchClass(this.classes[ this.board[idx2[1]][idx2[0]] ], this.classes[ this.board[idx1[1]][idx1[0]] ],
      this.board[idx2[1]][idx2[0]] === this.COLOR ? 0 : 500);

    let tmp = this.board[idx1[1]][idx1[0]];
    this.board[idx1[1]][idx1[0]] = this.board[idx2[1]][idx2[0]];
    this.board[idx2[1]][idx2[0]] = tmp;

    return;
  }

  private calcIndex(idx: [number, number]): number {
    return idx[1] * this.W + idx[0];
  }

  private isAdjacent(idx1: [number, number], idx2: [number, number]): boolean {
    if (idx1[0] === null || idx1[0] < 0 || idx1[0] >= this.W) return false;
    if (idx1[1] === null || idx1[1] < 0 || idx1[1] >= this.H) return false;
    if (idx2[0] === null || idx2[0] < 0 || idx2[0] >= this.W) return false;
    if (idx2[1] === null || idx2[1] < 0 || idx2[1] >= this.H) return false;

    if (idx1[0] === idx2[0] && (idx1[1] + 1 === idx2[1] || idx1[1] - 1 === idx2[1])) return true;
    if (idx1[1] === idx2[1] && (idx1[0] + 1 === idx2[0] || idx1[0] - 1 === idx2[0])) return true;

    return false;
  }

  private findDeleteCells(board: Array<Array<number>>): void {
    for (let i = 0; i < this.H; i++) {
      for (let j = 0; j < this.W; j++) {
        let cnt = 0;
        for (let k = i; k < this.H && this.board[i][j] === this.board[k][j] && cnt < 3; k++)
          cnt++;
        if (cnt >= 3) {
          for (let k = i; k < this.H && this.board[i][j] === this.board[k][j]; k++) {
            board[k][j] = this.COLOR;
          }
        }
        cnt = 0;
        for (let k = j; k < this.W && this.board[i][j] === this.board[i][k] && cnt < 3; k++)
          cnt++;
        if (cnt >= 3) {
          for (let k = j; k < this.W && this.board[i][j] === this.board[i][k]; k++) {
            board[i][k] = this.COLOR;
          }
        }
      }
    }

    return;
  }

  private deleteCells(): boolean {
    let copiedBoard = [];

    for (let i = 0; i < this.H; i++)
      copiedBoard[i] = this.board[i].concat();

    this.findDeleteCells(copiedBoard);

    let res = false;
    for (let i = 0; i < this.H; i++) {
      for (let j = 0; j < this.W; j++) {
        if (this.board[i][j] !== copiedBoard[i][j]) {
          let idx = this.calcIndex([j, i]);
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
  }

  private dropCells(): void {
    let dropped = true;
    let self = this;
    let loop = function() {
      if (dropped) {
        dropped = false;
        for (let i = 0; i < self.W; i++) {
          if (self.board[0][i] === self.COLOR) {
            let idx = self.calcIndex([i, 0]);
            self.board[0][i] = Math.floor(Math.random() * self.COLOR);
            $("#cell" + idx).switchClass(self.classes[self.COLOR], self.classes[ self.board[0][i] ], 0);
          }
        }
        for (let i = self.H - 1; i > 0; i--) {
          for (let j = 0; j < self.W; j++) {
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
  }
}

let puzzle: Puzzle = new Puzzle();
$("td").click(function() {
  let id: string = $(this).attr("id");
  let idx: number = +id.substr(4);
  let x = idx % puzzle.W, y = Math.floor(idx / puzzle.W);
  puzzle.selectCell([x, y]);
});
