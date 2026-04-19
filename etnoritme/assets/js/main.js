document.addEventListener("DOMContentLoaded", () => {
	const cards = Array.from(document.querySelectorAll(".post-card"));
	const chips = Array.from(document.querySelectorAll(".chip"));
	const searchInput = document.getElementById("search-input");
	const visibleCount = document.getElementById("visible-count");
	const emptyState = document.getElementById("empty-state");
	const tagButtons = Array.from(document.querySelectorAll(".tag-btn"));

	if (!cards.length) {
		return;
	}

	let activeFilter = "all";

	const normalize = (value) =>
		value
			.toLowerCase()
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "")
			.trim();

	const updateVisibleState = () => {
		const searchTerm = normalize(searchInput ? searchInput.value : "");

		const visible = cards.filter((card) => {
			const categoryText = normalize(card.dataset.category || "");
			const tagsText = normalize(card.dataset.tags || "");
			const titleText = normalize(card.querySelector("h3")?.textContent || "");
			const summaryText = normalize(card.querySelector("p")?.textContent || "");

			const matchFilter = activeFilter === "all" || categoryText.includes(normalize(activeFilter));
			const matchSearch =
				!searchTerm ||
				categoryText.includes(searchTerm) ||
				tagsText.includes(searchTerm) ||
				titleText.includes(searchTerm) ||
				summaryText.includes(searchTerm);

			const isVisible = matchFilter && matchSearch;
			card.classList.toggle("hidden", !isVisible);
			return isVisible;
		});

		if (visibleCount) {
			visibleCount.textContent = String(visible.length);
		}

		if (emptyState) {
			emptyState.classList.toggle("visible", visible.length === 0);
		}
	};

	chips.forEach((chip) => {
		chip.addEventListener("click", () => {
			chips.forEach((other) => other.classList.remove("active"));
			chip.classList.add("active");
			activeFilter = chip.dataset.filter || "all";
			updateVisibleState();
		});
	});

	if (searchInput) {
		searchInput.addEventListener("input", updateVisibleState);
	}

	tagButtons.forEach((button) => {
		button.addEventListener("click", () => {
			const tag = button.dataset.tag || "";
			if (searchInput) {
				searchInput.value = tag;
				searchInput.dispatchEvent(new Event("input"));
				searchInput.focus();
			}
		});
	});

	const revealElements = document.querySelectorAll(".fade-in");
	const revealObserver = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add("is-visible");
					revealObserver.unobserve(entry.target);
				}
			});
		},
		{ threshold: 0.12 }
	);

	revealElements.forEach((element) => revealObserver.observe(element));

	cards.forEach((card) => {
		card.addEventListener("mousemove", (event) => {
			const bounds = card.getBoundingClientRect();
			const x = event.clientX - bounds.left;
			const y = event.clientY - bounds.top;
			const midX = bounds.width / 2;
			const midY = bounds.height / 2;
			const rotateX = ((y - midY) / midY) * -4;
			const rotateY = ((x - midX) / midX) * 5;
			card.style.setProperty("--rx", `${rotateX.toFixed(2)}deg`);
			card.style.setProperty("--ry", `${rotateY.toFixed(2)}deg`);
		});

		card.addEventListener("mouseleave", () => {
			card.style.setProperty("--rx", "0deg");
			card.style.setProperty("--ry", "0deg");
		});
	});

	updateVisibleState();
});
