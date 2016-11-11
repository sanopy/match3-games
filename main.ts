/// <reference path="./typings/index.d.ts" />

class Puzzle {
  public W = 8;
  public H = 12;
  public COLOR = 5;
  private board = [];
  private classes = ["redCell", "greenCell", "blueCell", "yellowCell", "lightblueCell", "whiteCell"];
  private selectedCell: [number, number] = [null, null];

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
    if (this.isAdjacent(this.selectedCell, idx)) {
      this.swapCells(this.selectedCell, idx);

      // セレクト状態解除
      $("#cell" + this.calcIndex(this.selectedCell)).removeClass("selectedCell");
      this.selectedCell = [null, null];

      while (this.deleteCells())
        this.dropCells();

      console.log("-------------------------");
      for (let i = 0; i < this.H; i++)
        console.log(this.board[i]);

      return;
    }

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

  private deleteCells(): boolean {
    let res = false;
    for (let i = 0; i < this.H; i++) {
      for (let j = 0; j < this.W; j++) {
        if (this.board[i][j] !== this.COLOR) {
          let cnt = 0;
          for (let k = i; k < this.H && this.board[i][j] === this.board[k][j] && cnt < 3; k++)
            cnt++;
          if (cnt >= 3) {
            for (let k = i + 1; k < this.H && this.board[i][j] === this.board[k][j]; k++) {
              let idx = this.calcIndex([j, k]);
              $("#cell" + idx).switchClass(this.classes[ this.board[k][j] ], this.classes[this.COLOR], 500);
              this.board[k][j] = this.COLOR;
            }
            let idx = this.calcIndex([j, i]);
            $("#cell" + idx).switchClass(this.classes[ this.board[i][j] ], this.classes[this.COLOR], 500);
            this.board[i][j] = this.COLOR;
            res = true;
          }
          cnt = 0;
          for (let k = j; k < this.W && this.board[i][j] === this.board[i][k] && cnt < 3; k++)
            cnt++;
          if (cnt >= 3) {
            for (let k = j + 1; k < this.W && this.board[i][j] === this.board[i][k]; k++) {
              let idx = this.calcIndex([k, i]);
              $("#cell" + idx).switchClass(this.classes[ this.board[i][k] ], this.classes[this.COLOR], 500);
              this.board[i][k] = this.COLOR;
            }
            let idx = this.calcIndex([j, i]);
            $("#cell" + idx).switchClass(this.classes[ this.board[i][j] ], this.classes[this.COLOR], 500);
            this.board[i][j] = this.COLOR;
            res = true;
          }
        }
      }
    }
    return res;
  }

  private dropCells(): void {
    let dropped = true;
    while (dropped) {
      dropped = false;
      for (let i = 0; i < this.W; i++) {
        if (this.board[0][i] === this.COLOR) {
          let idx = this.calcIndex([i, 0]);
          this.board[0][i] = Math.floor(Math.random() * this.COLOR);
          $("#cell" + idx).switchClass(this.classes[this.COLOR], this.classes[ this.board[0][i] ], 500);
        }
      }
      for (let i = this.H - 1; i > 0; i--) {
        for (let j = 0; j < this.W; j++) {
          if (this.board[i][j] === this.COLOR && this.board[i - 1][j] !== this.COLOR) {
            dropped = true;
            this.swapCells([j, i], [j, i - 1]);
          }
        }
      }
    }
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
