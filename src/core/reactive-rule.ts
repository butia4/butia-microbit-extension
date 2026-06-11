// Reactive rules: level-triggered motor behaviors evaluated in the poll loop.
// Priority is computed internally — students never configure it.

namespace Butia {
    export interface IMotorIntent {
        left: number;
        right: number;
    }

    export interface IReactiveRule {
        evaluate(): boolean;
        action: ReactiveAction;
        target: MotorTarget;
        speed: number;
        priority(): number;
        suppressLineLoss?: boolean;
        lineLossStop?: boolean;
        motorIntent(): IMotorIntent;
        tick(): void;
        reset(): void;
    }

    const PRIORITY_STOP = 300;
    const PRIORITY_ARC = 240;
    const PRIORITY_BACKWARD = 200;
    const PRIORITY_TURN = 150;
    const PRIORITY_DIVERT = 120;
    const PRIORITY_FORWARD = 100;
    const BONUS_BOTH_MOTORS = 30;

    export function computePriority(action: ReactiveAction, target: MotorTarget): number {
        //if (action === ReactiveAction.ArcAround) return PRIORITY_ARC;

        let base = PRIORITY_FORWARD;
        if (action === ReactiveAction.Stop) base = PRIORITY_STOP;
        else if (action === ReactiveAction.Backward) base = PRIORITY_BACKWARD;
        else if (action === ReactiveAction.TurnLeft || action === ReactiveAction.TurnRight) base = PRIORITY_TURN;
        //else if (action === ReactiveAction.Divert) base = PRIORITY_DIVERT;

        const bonus = target === MotorTarget.Both ? BONUS_BOTH_MOTORS : 0;
        return base + bonus;
    }

    export function buildMotorIntent(
        action: ReactiveAction,
        target: MotorTarget,
        speed: number
    ): IMotorIntent {
        if (action === ReactiveAction.Stop) {
            return _intentForTarget(target, 0, 0);
        }

        if (action === ReactiveAction.Forward) {
            return _intentForTarget(target, speed, speed);
        }

        if (action === ReactiveAction.Backward) {
            return _intentForTarget(target, -speed, -speed);
        }

        if (action === ReactiveAction.TurnLeft) {
            return { left: -speed, right: speed };
        }

        if (action === ReactiveAction.TurnRight) {
            return { left: speed, right: -speed };
        }

        /*if (action === ReactiveAction.Divert) {
            const left = Math.round(speed * 0.7);
            const right = Math.round(speed * 1.3);
            return { left, right };
        }*/

        // ArcAround supplies intent via ArcManeuver — fallback to stop.
        return { left: 0, right: 0 };
    }

    function _intentForTarget(target: MotorTarget, left: number, right: number): IMotorIntent {
        if (target === MotorTarget.Left) return { left, right: 0 };
        if (target === MotorTarget.Right) return { left: 0, right };
        return { left, right };
    }
}
