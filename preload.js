const { contextBridge, ipcRenderer } = require("electron");
const { BSON } = require("realm");
const Realm = require("realm");

const dotenv = require("dotenv");
const result = dotenv.config({ path: __dirname + "/.env" });
if (result.error) {
  throw result.error;
}

const {
  renderMachineBtns,
  scanEmployee,
  messageHandler,
  renderItemInfo,
  reRenderMachineList,
  renderReset,
  inputClear,
  StopWatch,
  messageClear,
  autoFocus,
  animateStopWatch,
  animateScan,
  animateSuccess,
  animateEmp,
} = require("./renderer.js");
const {
  stationSchema,
  employeeSchema,
  timeSchema,
  time_stepsSchema,
  productSchema,
  product_stepsSchema,
  product_steps_stepSchema,
  itemSchema,
  item_locationSchema,
  item_location_checkpointsSchema,
  item_quantitySchema,
  missing_skuSchema,
} = require("./schema.js");

// Get the API key from the local environment
const apiKey = window.process.env.REALM_API;
if (!apiKey) {
  throw new Error("Could not find a Realm Server API Key.");
}

// Realm Login Credentials
const app = new Realm.App({ id: window.process.env.REALM_ID });
const cred = new Realm.Credentials.serverApiKey(apiKey);

// Main function Realm Login
const login = async () => {
  try {
    const check = await app.logIn(cred);
    if (check) {
      console.log(`Login sucess`);
    }
  } catch (err) {
    console.error("Failed to log in", err);
  }
};

login();
const openRealm = async () => {
  const realmFileBehavior = {
    type: "downloadBeforeOpen",
    timeOut: 1000,
    timeOutBehavior: "openLocalRealm",
  };

  const config = {
    schema: [
      stationSchema,
      employeeSchema,
      timeSchema,
      time_stepsSchema,
      productSchema,
      product_stepsSchema,
      product_steps_stepSchema,
      itemSchema,
      item_locationSchema,
      item_location_checkpointsSchema,
      item_quantitySchema,
      missing_skuSchema,
    ],
    sync: {
      user: app.currentUser,
      partitionValue: "user=dean",
      existingRealmFileBehavior: realmFileBehavior,
      newRealmFileBehavior: realmFileBehavior,
      clientReset: {
        mode: "discardLocal",
      },
    },
  };
  const realm = await Realm.open(config);
  return realm;
};

const itemUpload = (
  realm,
  item,
  product,
  miss,
  time,
  clock,
  empId,
  last,
  scan,
  now,
  machine
) => {
  // Get scan value and search for matching item
  const itemfound = item.filtered(`orderItemId == '${scan}'`);
  if (itemfound.length < 1) {
    messageHandler("Damage or Partial Barcode Contact Dean");
    inputClear();
    return;
  }
  clock.stop();
  clock.start();
  clock.test();
  animateStopWatch();
  animateScan();
  animateSuccess();
  document.querySelector("#last-item").value = scan;

  // Compare the found item against existing products
  const productfound = product.filtered(`sku == '${itemfound[0].sku}'`);
  const payload = {};
  if (productfound < 1) {
    const check = miss.filtered(`sku == '${itemfound[0].sku}'`);
    let product = {
      name: "",
      steps: {
        step: [
          {
            machine: "",
            info: "Infomation not availiable",
          },
        ],
      },
    };
    let sku = "not found";
    renderItemInfo(product, sku);
    payload["product"] = null;
    payload["productId"] = 0;
    // If no product skus match the item, report missing sku
    if (check < 1) {
      realm.write(() => {
        realm.create("missing_sku", itemfound[0]);
      });
      console.log("uploading missing sku");
    } else {
      console.log("sku already missing");
    }
  } else {
    renderItemInfo(productfound[0], itemfound[0].sku);
    console.log(productfound[0].name, productfound[0].productId);
    payload["product"] = productfound[0].name;
    payload["productId"] = productfound[0].productId;
  }

  // check if scanned time exists yet
  if (time.filtered(`orderItemId == '${scan}'`).length < 1) {
    payload["orderItemId"] = scan;
    payload["_partitionKey"] = "user=dean";
    (payload["_id"] = new BSON.ObjectId()),
      (payload["steps"] = [
        { empId: empId, machine: machine, start: now, stop: null },
      ]);
    payload["scans"] = 0;

    console.log(payload);
    realm.write(() => {
      realm.create("time", payload, "modified");
      console.log("initial time created");
    });

    // set up the location data for scanned item
    realm.write(() => {
      const loc = item.filtered(`orderItemId == '${scan}'`)[0];
      loc.location.current = "sewing";
      loc.location.checkpoints[4].empId = empId;
      loc.location.checkpoints[4].loc = "sewing";
      loc.location.checkpoints[4].date = now;
    });

    // this fires when a previously entered item is scanned on a new machine
  } else {
    realm.write(() => {
      const next = time.filtered(`orderItemId == '${scan}'`)[0];
      const t = next.scans;
      if (next.steps[t] == undefined) {
        next.steps.push({});
        next.steps[t] = {
          empId: empId,
          machine: machine,
          start: now,
          stop: null,
        };
        console.log("new step appended");
      }
    });
  }

  //TODO:: add Error Handler for back to back scans
  //TODO:: remove partitionKey on ship to indicate that it's no longer local
  // check for a previous item and update it's stop time
  if (last != "" && last != scan) {
    realm.write(() => {
      const update = time.filtered(`orderItemId == '${last}'`)[0];
      let s = update.scans;
      if (update.steps[s] !== undefined) {
        update._partitionKey = "user=dean";
        update.steps[s].stop = now;
        update.scans += 1;
        console.log("previous stop time updated");
      }
    });
  }
  inputClear();
};

const localLogout = (realm, time, last, scan, now) => {
  if (last != "" && last != scan) {
    realm.write(() => {
      const update = time.filtered(`orderItemId == '${last}'`)[0];
      let s = update.scans;
      if (update.steps[s] !== undefined) {
        update._partitionKey = "user=dean";
        update.steps[s].stop = now;
        update.scans += 1;
        console.log("previous stop time updated");
      }
    });
  }
};

// Rendering contextBrdige
contextBridge.exposeInMainWorld("electron", {
  autofocus: () => {
    console.log(`Context Isolation working`);
    autoFocus();
  },
  machineList: async () => {
    const realm = await openRealm();
    const station = realm.objects("station");
    renderMachineBtns(station);
  },
  login: async () => {
    const realm = await openRealm();
    const employee = realm.objects("employee");
    if (employee) {
      document.querySelector("#login").addEventListener("submit", async (e) => {
        e.preventDefault();
        const scan = document.querySelector("#login-input").value;
        scanEmployee(scan, employee);
      });
    }
  },
  scan: async () => {
    const realm = await openRealm();

    // set up realm objects
    const item = realm.objects("item");
    const product = realm.objects("product");
    const miss = realm.objects("missing_sku");
    const time = realm.objects("time");
    const face = document.querySelector("#sw-time");
    const clock = new StopWatch(face);

    if (realm) {
      document.querySelector("#scan").addEventListener("submit", async (e) => {
        e.preventDefault();
        messageClear();

        //set up some scan constants
        const empId = document.querySelector("#emp-id").value;
        const last = document.querySelector("#last-item").value;
        const scan = document.querySelector("#scan-input").value;
        const milli = Date.now();
        const now = new Date(milli).toUTCString();
        const machine = document
          .querySelector("#machine")
          .innerText.toLowerCase();

        if (scan.includes("emp") == true) {
          if (scan.match(/emp/g).length <= 1) {
            localLogout(realm, time, last, scan, now);
            clock.stop();
            renderReset();
            animateEmp();
            animateSuccess();
            document.querySelector("#scan-input").value = "";
            document.querySelector("#login-input").value = "";
            document.querySelector("#login-input").focus;
            return;
          } else {
            messageHandler("Double scan, please try again");
            inputClear();
            return;
          }
        } else if (scan.match(/I/gi) == null) {
          messageHandler("Invalid scan, please try again");
          inputClear();
          return;
        } else if (scan.match(/I/gi).length > 1) {
          messageHandler("Double scan, please try again");
          inputClear();
          return;
        } else {
          itemUpload(
            realm,
            item,
            product,
            miss,
            time,
            clock,
            empId,
            last,
            scan,
            now,
            machine
          );
        }
      });
      //No idea how to get the clock global outside of the scan Context bridge
      document.querySelector("#machine").addEventListener("click", async () => {
        const last = document.querySelector("#last-item").value;
        const scan = document.querySelector("#scan-input").value;
        const milli = Date.now();
        const now = new Date(milli).toUTCString();
        localLogout(realm, time, last, scan, now);
        renderReset();
        clock.stop();
        reRenderMachineList();
      });
    }
  },
});

//Ever App should implement shoudlCompactOnLaunch callback to periodically reduce realmsize
