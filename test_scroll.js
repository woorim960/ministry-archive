function performSync(scrollY, sourceTops, targetTops, sourceMax, targetMax) {
    const anchors = [{ s: 0, t: 0 }];
    
    // Simulate sourceTextTop = 600, targetTextTop = 200
    anchors.push({ s: 600, t: 200 });

    if (sourceTops.length === targetTops.length) {
      for (let i = 0; i < sourceTops.length; i++) {
        const s = sourceTops[i];
        const t = targetTops[i];
        if (s < sourceMax && t < targetMax) {
          anchors.push({ s, t });
        }
      }
    }

    anchors.push({ s: sourceMax, t: targetMax });

    let validAnchors = [anchors[0]];
    for (let i = 1; i < anchors.length; i++) {
      if (anchors[i].s > validAnchors[validAnchors.length - 1].s && anchors[i].t >= validAnchors[validAnchors.length - 1].t) {
        validAnchors.push(anchors[i]);
      } else if (i === anchors.length - 1) {
        validAnchors.push({
          s: Math.max(anchors[i].s, validAnchors[validAnchors.length - 1].s + 1),
          t: Math.max(anchors[i].t, validAnchors[validAnchors.length - 1].t)
        });
      }
    }

    let start = validAnchors[0];
    let end = validAnchors[validAnchors.length - 1];

    for (let i = 0; i < validAnchors.length - 1; i++) {
      if (scrollY >= validAnchors[i].s && scrollY <= validAnchors[i + 1].s) {
        start = validAnchors[i];
        end = validAnchors[i + 1];
        break;
      }
    }

    const sectionHeight = end.s - start.s;
    let sectionPercentage = sectionHeight > 0 ? (scrollY - start.s) / sectionHeight : 0;
    sectionPercentage = Math.max(0, Math.min(1, sectionPercentage));

    return start.t + (end.t - start.t) * sectionPercentage;
}

const sourceMax = 2000;
const targetMax = 1000;
const sourceTops = [1000];
const targetTops = [500];

console.log("scrollY 0 -> target", performSync(0, sourceTops, targetTops, sourceMax, targetMax));
console.log("scrollY 300 -> target", performSync(300, sourceTops, targetTops, sourceMax, targetMax));
console.log("scrollY 600 -> target", performSync(600, sourceTops, targetTops, sourceMax, targetMax));
console.log("scrollY 800 -> target", performSync(800, sourceTops, targetTops, sourceMax, targetMax));
console.log("scrollY 1000 -> target", performSync(1000, sourceTops, targetTops, sourceMax, targetMax));
console.log("scrollY 1500 -> target", performSync(1500, sourceTops, targetTops, sourceMax, targetMax));
console.log("scrollY 2000 -> target", performSync(2000, sourceTops, targetTops, sourceMax, targetMax));

