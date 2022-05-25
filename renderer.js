const messageHandler = (text) => {
  const h1 = document.createElement("h1");
  document.querySelector("#message").innerHTML = "";
  document.querySelector("#message").appendChild(h1);
  h1.innerText = text;
  h1.style.color = "red";
  animateError();
};
const messageClear = () => {
  document.querySelector("#message").innerHTML = "";
};

const inputClear = () => {
  document.querySelector("#scan-input").value = "";
  document.querySelector("#scan-input").focus;
};

const renderReset = () => {
  document.querySelector("#title").innerText = "Scan name to Sign in";
  document.querySelector("#login").style.display = "block";
  document.querySelector("#scan").style.display = "none";
  document.querySelector("#last-item").value = "";
  document.querySelector("#emp-id").value = "";
  document.querySelector("#message").innerHTML = "";
  document.querySelector("#previous-item").innerHTML = "";
  document.querySelector("#current-item").innerHTML = "";
  document.querySelector("#garment-card").style.visibility = "hidden";
  document.querySelector("#garment-info").innerHTML = "";
  document.querySelector("#session-count").innerText = "0";
  document.querySelector("#sw-time").style.color = "#000";
  const clock = document.querySelectorAll(".sw-flash")[0];
  const face = document.querySelectorAll(".sw-time")[0];
  clock.classList.remove("sw-scan");
  clock.classList.remove("sw-error");
  clock.classList.remove("emp-scan");
  face.classList.remove("sw-animate");
  face.classList.remove("sw-animate-error");
};

const animateStopWatch = () => {
  const face = document.querySelectorAll(".sw-time")[0];
  const timer = document.querySelector("#sw-time");
  face.classList.remove("sw-animate");
  face.classList.remove("sw-animate-error");
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      timer.style.color = "#5e5e5e";
      face.classList.add("sw-animate");
    });
  });
};

const animateSuccess = () => {
  const face = document.querySelectorAll(".sw-time")[0];
  face.classList.remove("sw-animate-success");
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      face.classList.add("sw-animate-success");
    });
  });
};

const animateScan = () => {
  const clock = document.querySelectorAll(".sw-flash")[0];
  clock.classList.remove("sw-scan");
  clock.classList.remove("sw-error");
  clock.classList.remove("emp-scan");
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      clock.classList.add("sw-scan");
    });
  });
};

const animateEmp = () => {
  const clock = document.querySelectorAll(".sw-flash")[0];
  const face = document.querySelectorAll(".sw-time")[0];
  clock.classList.remove("sw-scan");
  clock.classList.remove("sw-error");
  clock.classList.remove("emp-scan");
  face.classList.remove("sw-animate");
  face.classList.remove("sw-animate-error");
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      clock.classList.add("emp-scan");
    });
  });
};

const animateError = () => {
  const face = document.querySelectorAll(".sw-time")[0];
  face.classList.remove("sw-animate");
  face.classList.remove("sw-animate-error");
  face.classList.remove("sw-animate-success");

  const clock = document.querySelectorAll(".sw-flash")[0];
  clock.classList.remove("sw-error");
  clock.classList.remove("sw-scan");
  clock.classList.remove("emp-scan");

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      clock.classList.add("sw-error");
      face.classList.add("sw-animate-error");
    });
  });
};

const renderMachineBtns = (data) => {
  data.forEach((machine) => {
    const div = document.createElement("div");
    const btn = document.createElement("button");
    btn.classList.add("modal-btn");
    btn.innerText = machine.name.toUpperCase();
    btn.setAttribute("id", machine.name);
    div.appendChild(btn);
    const menu = document.querySelector("#main-menu");
    menu.appendChild(div);
    menu.lastElementChild.addEventListener("click", () => {
      selectMachine(machine.name);
    });
  });
};

const autoFocus = () => {
  const login = document.querySelector("#login");
  const scan = document.querySelector("#scan");
  const login_input = document.querySelector("#login-input");
  const scan_input = document.querySelector("#scan-input");
  const interval = () => {
    console.log("Checking focus");
    if (login.style.display !== "none") {
      if (login_input != document.activeElement) {
        login_input.focus();
        console.log("login has focus");
      }
    }
    if (scan.style.display !== "none") {
      if (scan_input != document.activeElement) {
        scan_input.focus();
        console.log("scan has focus");
      }
    }
  };
  setInterval(interval, 1000);
};

const renderItemInfo = (product, sku) => {
  document.querySelector("#previous-item").innerHTML =
    document.querySelector("#current-item").innerHTML;

  document.querySelector("#current-item").innerHTML = `sku: ${sku}`;
  document.querySelector("#garment-card").style.visibility = "visible";
  const gInfo = document.querySelector("#garment-info");
  gInfo.innerHTML = "";
  for (let i = 0; i < product.steps.step.length; i++) {
    const li = document.createElement("li");
    li.innerHTML = `${product.steps.step[i].machine} ${product.steps.step[i].info}`;
    gInfo.appendChild(li);
  }
  let count = document.querySelector("#session-count").innerText;
  count = parseInt(count);
  count++;
  document.querySelector("#session-count").innerText = count;
};

// Render the Scanner view for a selected Machine
const selectMachine = (name) => {
  const menu = document.querySelector("#modal-menu");
  menu.style.visibility = "hidden";
  name = name[0].toUpperCase() + name.slice(1);
  document.querySelector("#machine").innerText = name;
};

const reRenderMachineList = () => {
  const menu = document.querySelector("#modal-menu");
  menu.style.visibility = "visible";
  document.querySelector("#machine").innerText = "";
};

// Pass in the Form scan and Realm employee object and compare
const scanEmployee = (scan, emp) => {
  for (let i = 0; i < emp.length; i++) {
    if (scan == emp[i].empId) {
      document.querySelector("#emp-id").value = scan;
      document.querySelector(
        "#title"
      ).innerText = `${emp[i].firstName}  ${emp[i].lastName}`;
      document.querySelector("#login").style.display = "none";
      document.querySelector("#scan").style.display = "block";
      messageClear();
      animateEmp();
      animateSuccess();
      return;
    } else if (i == emp.length - 1) {
      const msg = `Invalid Employee Id`;
      messageHandler(msg);
      animateError();
      document.querySelector("#login-input").value = "";
      document.querySelector("#login-input").focus;
    }
  }
};

const scanItem = (scan, product, item) => {
  document.querySelector("#last-item").value = scan;

  for (let i = 0; i < product.length; i++) {
    for (let x = 0; x < product.length; x++) {
      if (product[i].sku[x] == item.sku) {
        return product[i];
      }
    }
  }
};

class StopWatch {
  constructor(args) {
    this.face = args;
  }

  now = 0;
  timer = "null";

  tick() {
    this.now++;
    let remain = this.now;
    let hours = Math.floor(remain / 3600);
    remain -= hours * 3600;
    let mins = Math.floor(remain / 60);
    remain -= mins * 60;
    let secs = remain;

    if (hours < 10) {
      hours = "0" + hours;
    }
    if (mins < 10) {
      mins = "0" + mins;
    }
    if (secs < 10) {
      secs = "0" + secs;
    }
    this.face.innerHTML = `${hours}:${mins}:${secs}`;
  }

  test() {
    console.log(this.face);
  }

  start() {
    console.log("Timer Running");
    this.timer = setInterval(() => {
      this.tick();
    }, 1000);
  }
  stop() {
    clearInterval(this.timer);
    this.now = 0;
    this.face.innerHTML = "00:00:00";
  }
}

module.exports = {
  messageClear,
  renderItemInfo,
  renderMachineBtns,
  reRenderMachineList,
  selectMachine,
  scanEmployee,
  scanItem,
  messageHandler,
  inputClear,
  autoFocus,
  animateStopWatch,
  animateScan,
  animateSuccess,
  animateEmp,
  renderReset,
  StopWatch,
};
