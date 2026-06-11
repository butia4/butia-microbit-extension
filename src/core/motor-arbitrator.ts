// MotorArbitrator: Brooks-style subsumption per motor channel (left / right).

namespace Butia {
    const NO_WINNER = -1;

    export function arbitrate(active: IReactiveRule[]): IMotorIntent {
        if (active.length === 0) {
            return { left: 0, right: 0 };
        }

        const suppressing = _hasLineLossSuppression(active);
        const competitors = suppressing
            ? active.filter(r => !r.lineLossStop)
            : active;

        const leftIdx = _pickChannelWinner(competitors, MotorTarget.Left);
        const rightIdx = _pickChannelWinner(competitors, MotorTarget.Right);

        const leftIntent = leftIdx !== NO_WINNER ? competitors[leftIdx].motorIntent() : { left: 0, right: 0 };
        const rightIntent = rightIdx !== NO_WINNER ? competitors[rightIdx].motorIntent() : { left: 0, right: 0 };

        return { left: leftIntent.left, right: rightIntent.right };
    }

    function _hasLineLossSuppression(active: IReactiveRule[]): boolean {
        for (const rule of active) {
            if (rule.suppressLineLoss) return true;
        }
        return false;
    }

    function _pickChannelWinner(rules: IReactiveRule[], channel: MotorTarget): number {
        let bestIdx = NO_WINNER;
        let bestPriority = -1;

        for (let i = 0; i < rules.length; i++) {
            const rule = rules[i];
            if (!_ruleAffectsChannel(rule, channel)) continue;

            const p = rule.priority();
            if (p > bestPriority) {
                bestPriority = p;
                bestIdx = i;
            }
        }

        return bestIdx;
    }

    function _ruleAffectsChannel(rule: IReactiveRule, channel: MotorTarget): boolean {
        if (rule.target === MotorTarget.Both) return true;
        return rule.target === channel;
    }
}
