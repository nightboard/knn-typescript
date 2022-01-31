const kCellInOneRow = 50;
const kCellWidthInPixel = 16;
const kTotalCells = kCellInOneRow ** 2;
const boxWidth = kCellWidthInPixel * kCellInOneRow;
let kKNNContant = 5;

interface Cell {
  x: number;
  y: number;
  button: HTMLButtonElement;
}

interface CellWithDistToSomePoint {
  x: number;
  y: number;
  dist: number;
  button: HTMLButtonElement;
}

enum Color {
  RED = "red",
  BLUE = "blue",
}

class Grid {
  grid_: Cell[][] = [];
  colorValue: Color = Color.RED;
  coloredCells: Cell[] = [];

  constructor() {
    const kUpperLimit = (kCellInOneRow - 1) / 2;
    const kLowerLimit = -1 * kUpperLimit;

    let row: Cell[] = [];
    for (let y = kUpperLimit; y >= kLowerLimit; y--) {
      for (let x = kLowerLimit; x <= kUpperLimit; x++) {
        row.push(this.getCell(x, y));
      }
      this.grid_.push(row);
      row = [];
    }
  }

  getCell(x: number, y: number): Cell {
    const btn = document.createElement("button") as HTMLButtonElement;
    btn.classList.add("btn");
    btn.style.width = `${kCellWidthInPixel}px`;
    btn.style.height = `${kCellWidthInPixel}px`;
    btn.addEventListener("click", () => {
      btn.style.backgroundColor = this.colorValue;
      this.coloredCells.push({ x, y, button: btn });
    });
    return {
      button: btn,
      x,
      y,
    };
  }

  renderGrid(container: HTMLDivElement | HTMLElement): void {
    for (let i = 0; i < kCellInOneRow; i++) {
      for (let j = 0; j < kCellInOneRow; j++) {
        container.appendChild(this.grid_[i][j].button);
      }
    }
    container.style.width = `${boxWidth}px`;
  }

  getColor(): Color {
    return this.colorValue;
  }

  setColor(color: Color) {
    this.colorValue = color;
  }

  performKNNForAllCell(): void {
    for (let i = 0; i < kCellInOneRow; i++) {
      for (let j = 0; j < kCellInOneRow; j++) {
        const color = this.grid_[i][j].button.style.backgroundColor;
        if (!(color == Color.RED || color == Color.BLUE)) {
          this.performKNN(i, j);
        }
      }
    }
  }

  performKNN(i: number, j: number) {
    const listWithDist: CellWithDistToSomePoint[] = this.getListWithDistance(
      i,
      j
    );

    const colorCategory: Color = this.getColorCategory(listWithDist);

    if (colorCategory == Color.RED) {
      this.grid_[i][j].button.style.backgroundColor = "#f4adad";
    } else {
      this.grid_[i][j].button.style.backgroundColor = "#adadfa";
    }
  }

  getColorCategory(listWithDist: CellWithDistToSomePoint[]): Color {
    let blueCount = 0,
      redCount = 0;

    for (let i = 0; i < kKNNContant; i++) {
      if (listWithDist[i].button.style.backgroundColor == Color.RED) {
        redCount++;
      } else {
        blueCount++;
      }
    }

    if (blueCount > redCount) {
      return Color.BLUE;
    }
    return Color.RED;
  }

  getListWithDistance(i: number, j: number): CellWithDistToSomePoint[] {
    const listWithDist: CellWithDistToSomePoint[] = [];
    const x = this.grid_[i][j].x;
    const y = this.grid_[i][j].y;

    for (let i = 0; i < this.coloredCells.length; i++) {
      listWithDist.push({
        x: this.coloredCells[i].x,
        y: this.coloredCells[i].y,
        dist:
          (this.coloredCells[i].x - x) ** 2 + (this.coloredCells[i].y - y) ** 2,
        button: this.coloredCells[i].button,
      });
    }

    listWithDist.sort((point1, point2) => {
      if (point1.dist < point2.dist) {
        return -1;
      }
      if (point1.dist > point2.dist) {
        return 1;
      }
      return 0;
    });

    return listWithDist;
  }
}

const box = document.querySelector(".box") as HTMLDivElement;
const grid = new Grid();

const redColorDiv = document.querySelector(".color-red") as HTMLDivElement;
const blueColorDiv = document.querySelector(".color-blue") as HTMLDivElement;
const kNNInput = document.querySelector("#knn-k-value") as HTMLInputElement;

redColorDiv.classList.add("active");

redColorDiv.addEventListener("click", () => {
  grid.setColor(Color.RED);
  redColorDiv.classList.add("active");
  blueColorDiv.classList.remove("active");
});

blueColorDiv.addEventListener("click", () => {
  grid.setColor(Color.BLUE);
  redColorDiv.classList.remove("active");
  blueColorDiv.classList.add("active");
});

kNNInput.value = `${kKNNContant}`;
kNNInput.addEventListener("change", () => {
  kKNNContant = parseInt(kNNInput.value);
});

grid.renderGrid(box);

document.querySelector("#calculate-btn")?.addEventListener("click", () => {
  grid.performKNNForAllCell();
});
