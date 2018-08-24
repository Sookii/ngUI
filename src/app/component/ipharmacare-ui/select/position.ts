export class Position {
	private getClosestNotStaticParent(hostEl: HTMLElement): HTMLElement {
		let parentEl = <HTMLElement>hostEl.parentElement;

		while (parentEl && parentEl !== document.documentElement && this.isStaticPositioned(parentEl)) {
			parentEl = <HTMLElement>parentEl.parentElement;
		}

		return parentEl;
	}

	private getStyle(el: HTMLElement, prop: string) {
		return window.getComputedStyle(el)[prop];
	}

	private isStaticPositioned(el: HTMLElement) {
		return (this.getStyle(el, 'position') || 'static') === 'static';
	}

	public layout(targetEl: HTMLElement) {
		let parentEl = <HTMLElement>this.getClosestNotStaticParent(targetEl);

		let parentOffset = parentEl.getBoundingClientRect(),
			targetOffset = targetEl.getBoundingClientRect();

		return {
			left: Math.round(targetOffset.left - parentOffset.left) + 'px',
			top: Math.round(targetOffset.bottom - parentOffset.top) + 'px',
            width: Math.round(targetOffset.width) + 'px',
            height: Math.round(targetOffset.height) + 'px'
		};
	}

	public layoutFixed(targetEl: HTMLElement) {

		let targetOffset = targetEl.getBoundingClientRect();

		return {
			left: Math.round(targetOffset.left) + 'px',
			top: Math.round(targetOffset.bottom) + 'px',
			width: Math.round(targetOffset.width) + 'px'
		};
	}
}

const position = new Position();

export function layout(targetEl: HTMLElement) {
	return position.layout(targetEl);
}

export function layoutFixed(targetEl: HTMLElement) {
	return position.layoutFixed(targetEl);
}