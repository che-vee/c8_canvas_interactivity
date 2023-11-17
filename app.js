const canvas = document.getElementById("canvas");
const canvasContext = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 800;

const numPoints = 20;
const pointDistance = canvas.width / numPoints;
const gravity = 0.5;
const friction = 0.98;
const ropePoints = [];

for (let i = 0; i <= numPoints; i++) {
	ropePoints.push({
		x: i * pointDistance,
		y: canvas.height / 2,
		oldX: i * pointDistance,
		oldY: canvas.height / 2,
	});
}

const updatePoints = () => {
	for (let i = 1; i < ropePoints.length - 1; i++) {
		const p = ropePoints[i];

		// Verlet integration
		const vx = (p.x - p.oldX) * friction;
		const vy = (p.y - p.oldY) * friction;

		p.oldX = p.x;
		p.oldY = p.y;
		p.x += vx;
		p.y += vy + gravity;
	}
};

// distance constraint between adjacent points of the rope
const constrainPoints = () => {
	for (let i = 0; i < ropePoints.length - 1; i++) {
		const p1 = ropePoints[i];
		const p2 = ropePoints[i + 1];
		const dx = p2.x - p1.x;
		const dy = p2.y - p1.y;
		const distance = Math.sqrt(dx * dx + dy * dy);
		const difference = pointDistance - distance;
		const percent = difference / distance / 2;
		const offsetX = dx * percent;
		const offsetY = dy * percent;

		if (!p1.isFixed) {
			p1.x -= offsetX;
			p1.y -= offsetY;
		}
		if (!p2.isFixed) {
			p2.x += offsetX;
			p2.y += offsetY;
		}
	}
};

const drawRope = () => {
	const gradient = canvasContext.createLinearGradient(0, 0, canvas.width, 0);
	gradient.addColorStop(0, "#a18cd1");
	gradient.addColorStop(0.5, "#fbc2eb");
	gradient.addColorStop(1, "#a18cd1");

	canvasContext.shadowBlur = 10;
	canvasContext.shadowOffsetX = 2;
	canvasContext.shadowOffsetY = 2;
	canvasContext.shadowColor = gradient;

	canvasContext.beginPath();
	for (let i = 0; i < ropePoints.length - 1; i++) {
		const p = ropePoints[i];
		const nextP = ropePoints[i + 1];
		canvasContext.moveTo(p.x, p.y);
		canvasContext.lineTo(nextP.x, nextP.y);
	}
	canvasContext.strokeStyle = gradient;
	canvasContext.lineWidth = 5;
	canvasContext.stroke();

	canvasContext.shadowBlur = 0;
	canvasContext.shadowOffsetX = 0;
	canvasContext.shadowOffsetY = 0;
};

const animate = () => {
	canvasContext.clearRect(0, 0, canvas.width, canvas.height);
	updatePoints();
	constrainPoints();
	drawRope();
	requestAnimationFrame(animate);
};

ropePoints[0].isFixed = true;
ropePoints[numPoints].isFixed = true;

animate();

let isMouseDown = false;
let selectedPointIndex = -1;

const getClosestPointIndex = (mouseX, mouseY) => {
	let closestDist = Infinity;
	let closestIndex = -1;

	ropePoints.forEach((p, index) => {
		const dx = mouseX - p.x;
		const dy = mouseY - p.y;
		const distance = Math.sqrt(dx * dx + dy * dy);

		if (distance < closestDist) {
			closestDist = distance;
			closestIndex = index;
		}
	});

	return closestIndex;
};

canvas.addEventListener("mousedown", (e) => {
	const rect = canvas.getBoundingClientRect();
	const scaleX = canvas.width / rect.width;
	const scaleY = canvas.height / rect.height;
	const canvasX = (e.clientX - rect.left) * scaleX;
	const canvasY = (e.clientY - rect.top) * scaleY;

	selectedPointIndex = getClosestPointIndex(canvasX, canvasY);
	isMouseDown = true;
});

canvas.addEventListener("mousemove", (e) => {
	if (!isMouseDown) return;

	const rect = canvas.getBoundingClientRect();
	const scaleX = canvas.width / rect.width;
	const scaleY = canvas.height / rect.height;
	const canvasX = (e.clientX - rect.left) * scaleX;
	const canvasY = (e.clientY - rect.top) * scaleY;

	if (selectedPointIndex !== -1) {
		ropePoints[selectedPointIndex].x = canvasX;
		ropePoints[selectedPointIndex].y = canvasY;
	}
});

canvas.addEventListener("mouseup", () => {
	isMouseDown = false;
	selectedPointIndex = -1;
});

canvas.addEventListener("mouseleave", () => {
	isMouseDown = false;
	selectedPointIndex = -1;
});

let bothEndsFixed = true;

const toggleRopeFix = () => {
	bothEndsFixed = !bothEndsFixed;
	ropePoints[numPoints].isFixed = bothEndsFixed;

	document.getElementById("toggle-rope").classList.toggle("selected-button");
};

document.getElementById("toggle-rope").addEventListener("click", toggleRopeFix);
