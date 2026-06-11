// ArcManeuver: internal state machine for the Rodear composite behavior.
// Not visible to students — updated via tick() each poll cycle.
/*
namespace Butia {
    const DESVIAR_CYCLES = 8;
    const ARCO_CYCLES = 20;
    const CERRAR_CYCLES = 10;

    const enum ArcPhase {
        Desviar = 0,
        Arco = 1,
        Cerrar = 2,
        BuscarLinea = 3,
    }

    export class ArcManeuver {
        private _side: ArcSide;
        private _speed: number;
        private _phase: ArcPhase;
        private _cycles: number;

        constructor(side: ArcSide, speed: number) {
            this._side = side;
            this._speed = speed;
            this.reset();
        }

        tick(): void {
            this._cycles++;
            if (this._phase === ArcPhase.Desviar && this._cycles >= DESVIAR_CYCLES) {
                this._phase = ArcPhase.Arco;
                this._cycles = 0;
            } else if (this._phase === ArcPhase.Arco && this._cycles >= ARCO_CYCLES) {
                this._phase = ArcPhase.Cerrar;
                this._cycles = 0;
            } else if (this._phase === ArcPhase.Cerrar && this._cycles >= CERRAR_CYCLES) {
                this._phase = ArcPhase.BuscarLinea;
                this._cycles = 0;
            }
        }

        reset(): void {
            this._phase = ArcPhase.Desviar;
            this._cycles = 0;
        }

        getPhase(): number {
            return this._phase;
        }

        getIntent(): IMotorIntent {
            if (this._side === ArcSide.Right) {
                return this._intentRight();
            }
            return this._intentLeft();
        }

        private _intentRight(): IMotorIntent {
            if (this._phase === ArcPhase.Desviar) {
                return { left: this._scale(35), right: this._scale(65) };
            }
            if (this._phase === ArcPhase.Arco) {
                return { left: this._scale(40), right: this._scale(70) };
            }
            if (this._phase === ArcPhase.Cerrar) {
                return { left: this._scale(30), right: -this._scale(25) };
            }
            return { left: this._speed, right: this._speed };
        }

        private _intentLeft(): IMotorIntent {
            if (this._phase === ArcPhase.Desviar) {
                return { left: this._scale(65), right: this._scale(35) };
            }
            if (this._phase === ArcPhase.Arco) {
                return { left: this._scale(70), right: this._scale(40) };
            }
            if (this._phase === ArcPhase.Cerrar) {
                return { left: -this._scale(25), right: this._scale(30) };
            }
            return { left: this._speed, right: this._speed };
        }

        private _scale(base: number): number {
            return Math.round(base * this._speed / 50);
        }
    }
}*/
