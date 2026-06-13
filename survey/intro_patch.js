(() => {
  if (typeof I18N === "undefined") return;

  Object.assign(I18N.zh, {
    introTitle:"研究场景介绍",
    introDesc:"在开始问卷前，请先观看下面的简短动画，并根据文字说明理解本研究中“机器人主动社交接触”的含义。",
    introP1:"请将本研究中的机器人想象为一个具有人形上半身结构的社交机器人：它具有类似人体结构的机械手臂和手部，整体身高略低于成年人，主要通过手臂或手部主动触碰人的身体。",
    introP2:"本问卷中的“触碰”指机器人对人身体发起的直接、短暂、柔和、非疼痛、非强制性的身体接触。请先判断机器人是否适合通过这种接触表达某种社交意图，再在后续页面标注你认为可接受或不可接受的身体区域。",
    introContinue:"我已理解，继续 →",
    consentP1:"本问卷旨在了解：当具有人形上半身结构的社交机器人，通过手臂或手部发起直接、短暂、柔和的身体接触来传达不同社交意图时，人们对不同身体区域被触碰的接受程度。",
    consentP4:"请确认你已年满 18 岁后再继续填写本问卷。",
    consentCheck:"我已认真阅读以上说明，并同意参与本研究。",
    intentDesc:"以下列出 16 类可能通过触碰表达的社交意图。请根据你的直觉，选择你认为“社交机器人可以通过主动触碰人的身体来表达”的意图。",
    currentIntentLabel:"当前意图",
    mapDesc:"请针对当前意图，在身体地图上标注：哪些身体区域你愿意被机器人触碰，哪些身体区域你不愿意被机器人触碰。未标注区域将视为无明确意向。",
    backToContextFull:"← 返回关系/场景",
    progressIntro:"研究场景介绍"
  });

  Object.assign(I18N.en, {
    introTitle:"Study Scenario",
    introDesc:"Before starting the survey, please watch the short animation below and read the description of what robot-initiated social touch means in this study.",
    introP1:"Please imagine the robot in this study as a social robot with a humanoid upper-body structure. It has mechanical arms and hands shaped similarly to human arms and hands, is slightly shorter than an adult, and mainly initiates touch through its arm or hand.",
    introP2:"In this survey, touch means direct, brief, gentle, non-painful, and non-coercive physical contact initiated by the robot on a person's body. You will first judge whether a robot could express a social intent through this kind of touch, and later mark which body regions you find acceptable or unacceptable.",
    introContinue:"I understand, continue →",
    consentP1:"This survey investigates how acceptable people find being touched on different body regions when a social robot with a humanoid upper-body structure uses its arm or hand to initiate direct, brief, and gentle physical contact to convey different social intents.",
    consentP4:"Please confirm that you are at least 18 years old before continuing this survey.",
    consentCheck:"I have carefully read the information above and agree to participate in this study.",
    intentDesc:"The following list contains 16 social intents that may be expressed through touch. Based on your intuition, select the intents that you think a social robot could express by actively touching a person's body.",
    currentIntentLabel:"Current intent",
    mapDesc:"For the current intent, mark on the body map which body regions you would be willing to let the robot touch and which regions you would not be willing to let the robot touch. Unmarked regions will be treated as no clear preference.",
    backToContextFull:"← Back to relationship/context",
    progressIntro:"Study scenario"
  });

  if (typeof buildSurveyPayload === "function") {
    const originalBuildSurveyPayload = buildSurveyPayload;
    buildSurveyPayload = function patchedBuildSurveyPayload() {
      const payload = originalBuildSurveyPayload();
      payload.metadata = payload.metadata || {};
      payload.metadata.ageRequirement = "Participants are instructed to continue only if they are at least 18 years old.";
      return payload;
    };
  }

  if (typeof prog === "function") {
    prog = function patchedProgress() {
      const f = document.getElementById("pFill");
      const textEl = document.getElementById("pText");
      if (!f || !textEl) return;
      if (document.getElementById("sIntro")?.classList.contains("active")) {
        f.style.width = "6%";
        textEl.textContent = t("progressIntro");
      } else if (document.getElementById("s0")?.classList.contains("active")) {
        f.style.width = "12%";
        textEl.textContent = t("progressConsent");
      } else if (document.getElementById("sInfo")?.classList.contains("active")) {
        f.style.width = "22%";
        textEl.textContent = t("progressInfo");
      } else if (document.getElementById("s1")?.classList.contains("active")) {
        f.style.width = "35%";
        textEl.textContent = t("progressIntents");
      } else if (document.getElementById("sContext")?.classList.contains("active")) {
        const count = Math.max(order.length, 1);
        const pct = 35 + Math.round((contextIdx + 1) / count * 13);
        f.style.width = pct + "%";
        textEl.textContent = `${t("progressContext")} ${contextIdx + 1}/${count}`;
      } else if (document.getElementById("s2")?.classList.contains("active")) {
        const count = Math.max(order.length, 1);
        const pct = 48 + Math.round((idx + 1) / count * 37);
        f.style.width = pct + "%";
        textEl.textContent = `${t("progressMap")} ${idx + 1}/${count}`;
      } else if (document.getElementById("s3")?.classList.contains("active")) {
        f.style.width = "95%";
        textEl.textContent = t("progressReview");
      } else {
        f.style.width = "100%";
        textEl.textContent = t("progressStatus");
      }
    };
  }

  if (typeof setLang === "function") setLang(lang);
  if (typeof prog === "function") prog();
})();
