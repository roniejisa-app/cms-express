const plugin = (editor, opts = {}) => {
	const options = {
		id: "countdown",
		label: "Countdown",
		block: {},
		props: {},
		style: "",
		styleAdditional: "",
		startTime: "",
		endText: "EXPIRED",
		dateInputType: "date",
		labelDays: "days",
		labelHours: "hours",
		labelMinutes: "minutes",
		labelSeconds: "seconds",
		classPrefix: "countdown",
		...opts,
	};

	const { block, props, style } = options;
	const id = options.id;
	const label = options.label;
	const pfx = options.classPrefix;

	// Create block
	if (block) {
		editor.Blocks.add(id, {
			media: `<svg viewBox="0 0 24 24">
        <path fill="currentColor" d="M12 20C16.4 20 20 16.4 20 12S16.4 4 12 4 4 7.6 4 12 7.6 20 12 20M12 2C17.5 2 22 6.5 22 12S17.5 22 12 22C6.5 22 2 17.5 2 12C2 6.5 6.5 2 12 2M17 11.5V13H11V7H12.5V11.5H17Z" />
      </svg>`,
			label,
			category: "Extra",
			select: true,
			content: { type: id },
			...block,
		});
	}

	const coundownScript = function (props) {
		const startfrom = props.startfrom;
		const endTxt = props.endText;
		// @ts-ignore
		const el = this;
		const countDownDate = new Date(startfrom).getTime();
		const countdownEl = el.querySelector("[data-js=countdown]");
		const endTextEl = el.querySelector("[data-js=countdown-endtext]");
		const dayEl = el.querySelector("[data-js=countdown-day]");
		const hourEl = el.querySelector("[data-js=countdown-hour]");
		const minuteEl = el.querySelector("[data-js=countdown-minute]");
		const secondEl = el.querySelector("[data-js=countdown-second]");
		const oldInterval = el.__gjsCountdownInterval;
		oldInterval && clearInterval(oldInterval);

		const connected = window.__gjsCountdownIntervals || [];
		const toClean = [];
		connected.forEach((item) => {
			if (!item.isConnected) {
				clearInterval(item.__gjsCountdownInterval);
				toClean.push(item);
			}
		});
		connected.indexOf(el) < 0 && connected.push(el);
		window.__gjsCountdownIntervals = connected.filter(
			(item) => toClean.indexOf(item) < 0
		);

		const setTimer = function (days, hours, minutes, seconds) {
			dayEl.innerHTML = `${days < 10 ? "0" + days : days}`;
			hourEl.innerHTML = `${hours < 10 ? "0" + hours : hours}`;
			minuteEl.innerHTML = `${minutes < 10 ? "0" + minutes : minutes}`;
			secondEl.innerHTML = `${seconds < 10 ? "0" + seconds : seconds}`;
		};

		const moveTimer = function () {
			const now = new Date().getTime();
			const distance = countDownDate - now;
			const days = Math.floor(distance / 86400000);
			const hours = Math.floor((distance % 86400000) / 3600000);
			const minutes = Math.floor((distance % 3600000) / 60000);
			const seconds = Math.floor((distance % 60000) / 1000);

			setTimer(days, hours, minutes, seconds);

			if (distance < 0) {
				clearInterval(el.__gjsCountdownInterval);
				endTextEl.innerHTML = endTxt;
				countdownEl.style.display = "none";
				endTextEl.style.display = "";
			}
		};

		if (countDownDate) {
			el.__gjsCountdownInterval = setInterval(moveTimer, 1000);
			endTextEl.style.display = "none";
			countdownEl.style.display = "";
			moveTimer();
		} else {
			setTimer(0, 0, 0, 0);
		}
	};

	// Create component
	editor.Components.addType(id, {
		model: {
			defaults: {
				startfrom: options.startTime,
				classes: [pfx],
				endText: options.endText,
				droppable: false,
				script: coundownScript,
				"script-props": ["startfrom", "endText"],
				traits: [
					{
						label: "Start",
						name: "startfrom",
						changeProp: true,
						type: options.dateInputType,
					},
					{
						label: "End text",
						name: "endText",
						changeProp: true,
					},
				],
				// @ts-ignore
				components: `
          <span data-js="countdown" class="${pfx}-cont">
            <div class="${pfx}-block">
              <div data-js="countdown-day" class="${pfx}-digit"></div>
              <div class="${pfx}-label">${options.labelDays}</div>
            </div>
            <div class="${pfx}-block">
              <div data-js="countdown-hour" class="${pfx}-digit"></div>
              <div class="${pfx}-label">${options.labelHours}</div>
            </div>
            <div class="${pfx}-block">
              <div data-js="countdown-minute" class="${pfx}-digit"></div>
              <div class="${pfx}-label">${options.labelMinutes}</div>
            </div>
            <div class="${pfx}-block">
              <div data-js="countdown-second" class="${pfx}-digit"></div>
              <div class="${pfx}-label">${options.labelSeconds}</div>
            </div>
          </span>
          <span data-js="countdown-endtext" class="${pfx}-endtext"></span>
        `,
				styles:
					(style ||
						`
          .${pfx} {
            text-align: center;
          }

          .${pfx}-block {
            display: inline-block;
            margin: 0 10px;
            padding: 10px;
          }

          .${pfx}-digit {
            font-size: 5rem;
          }

          .${pfx}-endtext {
            font-size: 5rem;
          }

          .${pfx}-cont {
            display: inline-block;
          }
        `) + options.styleAdditional,
				...props,
			},
		},
	});
};

export default plugin;