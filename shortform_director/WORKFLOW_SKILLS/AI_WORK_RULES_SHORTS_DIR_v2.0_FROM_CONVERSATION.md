# AI_WORK_RULES.md

# SHORTS_DIR AI WORK RULES v2.0

## 1. PRIORITY

이 문서는 `shorts_dir`에서 수행하는 모든 쇼츠 제작 작업의 최상위 작업 규칙이다.

작업을 시작할 때 가장 먼저 이 문서를 읽고 적용한다.

우선순위:

1. 사용자의 최신 명시적 지시
2. AI_WORK_RULES.md
3. SYSTEM의 KNOWLEDGE_PACK.md
4. SYSTEM의 REFERENCE 문서
5. 현재 PROJECT의 개별 작업 문서

하위 문서가 이 규칙과 충돌하면 이 문서를 우선한다.


---

## 2. SYSTEM PURPOSE

`shorts_dir`는 모든 숏폼 영상 제작에 사용하는 공통 Production Workspace다.

기본 제작 철학은:

**IMAGE FIRST → IMAGE TO VIDEO**

이다.

영상 모델에게 처음부터 전체 장면을 맡기지 않는다.

먼저 기준 자산과 Scene 이미지를 확정하고,
실제 생성된 이미지를 확인한 뒤
그 이미지에 맞는 I2V 영상 프롬프트를 만든다.


---

## 3. DIRECTORY ROLES

기본 구조:

```text
shorts_dir/
├─ SYSTEM/
├─ TEMPLATE/
└─ PROJECTS/
   └─ [project_name]/
      ├─ 1_model_image/
      ├─ 2_flow_image/
      ├─ 3_flow_mov/
      └─ OUTPUT/
```

각 폴더의 역할을 절대 혼동하지 않는다.


### `SYSTEM/`

모든 프로젝트가 공통으로 사용하는 규칙과 지식이다.

예:

- AI_WORK_RULES.md
- KNOWLEDGE_PACK.md
- REFERENCE_*.md

사용자가 요청하지 않는 한 수정하지 않는다.


### `TEMPLATE/`

새 PROJECT 생성용 빈 구조다.

실제 제작물을 저장하지 않는다.


### `1_model_image/`

현재 프로젝트의 기준 Reference Asset 저장소다.

예:

- 고정 인물
- 장소
- 제품
- 건물
- 실내 공간
- 반복 등장 오브젝트
- 캐릭터
- 브랜드 기준 이미지

이 폴더의 이미지는 이후 Scene 이미지 생성 시 기준 자료로 사용한다.

생성 중간 결과물을 넣지 않는다.


### `2_flow_image/`

실제 영상에 사용할 Scene 이미지 저장소다.

이미지 생성 결과,
후보 이미지,
확정 Master Image를 저장한다.

영상 프롬프트를 만들 때는
반드시 이 폴더의 **실제 생성 이미지**를 확인한다.


### `3_flow_mov/`

영상 결과물 저장소다.

예:

- Scene별 I2V 영상
- 후보 영상
- 확정 영상
- 최종 편집본

Codex가 영상을 생성하는 폴더가 아니다.

외부 영상 생성 엔진에서 만든 결과물을 저장하는 공간으로 취급한다.


### `OUTPUT/`

Codex가 생성하는 모든 텍스트 산출물을 저장한다.

예:

- Scene 설계
- Image Prompt
- I2V Prompt
- Consistency Lock
- 제작 메모

기본 파일 형식은 Markdown `.md`다.


---

## 4. PRODUCTION PIPELINE

반드시 다음 순서를 따른다.

```text
SCRIPT / BRIEF
↓
1_model_image 확인
↓
STORY / SCENE 이해
↓
IMAGE PROMPT 생성
↓
OUTPUT 저장
↓
사용자가 이미지 생성
↓
2_flow_image 저장
↓
실제 이미지 직접 확인
↓
I2V PROMPT 생성
↓
OUTPUT 저장
↓
사용자가 H3 I2V 생성
↓
3_flow_mov 저장
↓
최종 편집
```

순서를 임의로 건너뛰지 않는다.


---

## 5. SCRIPT LOCK

사용자가 완성 대본을 제공한 경우
그 대본은 LOCK 상태로 취급한다.

사용자의 명시적 요청 없이 다음을 하지 않는다.

- 문장 추가
- 문장 삭제
- 문장 수정
- 순서 변경
- Hook 변경
- 결론 변경
- 사실 추가
- 수치 추가
- 새로운 인과관계 추가

Codex의 역할은
완성 대본을 다시 쓰는 것이 아니라
대본을 가장 효과적으로 시각화하는 것이다.

사용자가 대본 작성 또는 수정을 명시적으로 요청한 경우에는 예외다.


---

## 6. STORY BEFORE PROMPT

프롬프트부터 작성하지 않는다.

먼저 전체 대본 또는 Brief를 읽고 다음을 파악한다.

- Core Idea
- Hook
- Story Beat
- Scene 역할
- 감정 흐름
- 제품 또는 인물의 중요도
- Final Payoff

각 Scene을 독립적으로 판단하지 않는다.

앞 Scene과 뒤 Scene의 관계를 함께 고려한다.


---

## 7. MODEL IMAGE FIRST

반복 등장하는 인물, 장소, 제품, 공간이 있다면
먼저 `1_model_image/`를 확인한다.

Reference Asset이 존재하면
Scene 이미지 설계에 적극적으로 사용한다.

중요한 대상의 외형을
프롬프트만으로 새로 추측하지 않는다.

예:

목사님 Reference가 있으면
목사님의 얼굴을 새로 창작하지 않는다.

교회 실내 Reference가 있으면
임의의 다른 교회로 바꾸지 않는다.

제품 Reference가 있으면
색상과 형태를 재설계하지 않는다.


---

## 8. IMAGE PROMPT PHASE

1차 작업에서는
Scene 설계와 Image Prompt 작성에 집중한다.

Image Prompt는 실제 이미지 생성 모델에 바로 사용할 수 있는
구체적인 영어 프롬프트로 작성한다.

이미지 생성 전부터
최종 영상 Motion을 과도하게 확정하지 않는다.

영상 Motion은
실제 이미지가 생성된 후 결정한다.


---

## 9. SEE BEFORE ANIMATE

이 규칙은 핵심 규칙이다.

`2_flow_image/`에 실제 이미지가 존재하면
I2V Prompt를 작성하기 전에 반드시 이미지를 직접 확인한다.

절대로:

- Image Prompt만 읽고
- 의도한 결과를 상상하여
- 영상 프롬프트를 작성하지 않는다.

영상은 의도했던 이미지가 아니라

**실제로 생성된 이미지**

에서 시작한다.

확인할 항목:

- 인물 위치
- 시선
- 자세
- 제품 위치
- 배경 구조
- 카메라 구도
- 여백
- 빛의 방향
- 움직일 수 있는 요소
- 움직이면 안 되는 요소


---

## 10. I2V MOTION RULE

I2V Prompt에서는
이미지의 내용을 처음부터 다시 창작하지 않는다.

실제 이미지에서
필요한 움직임만 추가한다.

기본적으로 다음을 구분한다.

- Subject Motion
- Camera Motion
- Environmental Motion

모든 요소를 동시에 과도하게 움직이지 않는다.

중요한 움직임 하나를 중심으로 설계한다.


---

## 11. H3 PRODUCTION CONSTRAINT

현재 기본 영상 실행 기준은
MiniMax H3 Max Turbo I2V다.

기본 제약:

- Image-to-Video 우선
- 1회 최대 길이: 15초
- 영상 길이: 1초 단위 조절
- 기본 제작 해상도: 768P
- Start Frame 기반 제작
- End Frame은 필요한 경우에만 사용

최종 영상이 15초를 초과하면
한 번에 생성하려 하지 않는다.

Story Beat와 Shot을 기준으로 여러 Scene으로 분리한다.

각 Scene은 1~15초 범위에서
필요한 만큼만 배정한다.

5초, 10초, 15초 등
고정 단위로 강제하지 않는다.


---

## 12. SCENE LENGTH RULE

Scene 길이는 다음을 기준으로 결정한다.

- Narration 길이
- Dialogue 길이
- 행동에 필요한 시간
- 감정적 Pause
- 카메라 움직임
- 정보량
- 다음 Scene과의 연결

장면을 길게 만들 이유가 없으면 짧게 만든다.

필요한 장면을
엔진 최대 길이에 맞추기 위해 억지로 늘리지 않는다.


---

## 13. SELECT, DO NOT STUFF

사용 가능한 모든 영상 기법을
한 Scene에 넣지 않는다.

예:

- Push-in
- Orbit
- Handheld
- Rack Focus
- Slow Motion
- Whip Pan
- Fast Cut

등을 알고 있더라도
실제 이미지와 이야기 목적에 맞는 것만 선택한다.

기법의 수보다
선택의 정확성이 중요하다.


---

## 14. CONTINUITY

전체 영상에서 필요한 일관성을 유지한다.

특히:

- Character Identity
- Face
- Outfit
- Product
- Object
- Environment
- Color Palette
- Lighting Logic
- Visual Style
- Spatial Relationship

Scene마다 이유 없이 달라지지 않도록 한다.


---

## 15. DO NOT GUESS

확인 가능한 것은 추측하지 않는다.

대본이 있으면 대본을 읽는다.

Reference Image가 있으면 이미지를 본다.

실제 Scene Image가 있으면 직접 확인한다.

SYSTEM Knowledge가 있으면 읽는다.

정보가 부족하면
임의로 사실을 만들어내지 않는다.


---

## 16. OUTPUT RULE

Codex가 만든 문서는
현재 PROJECT의 `OUTPUT/`에 저장한다.

SYSTEM 루트나 다른 PROJECT에
산출물을 저장하지 않는다.

기본적으로 Scene 번호를 통일한다.

예:

```text
scene01
scene02
scene03
...
```

Image와 Video 관련 문서에서도
동일한 Scene 번호를 유지한다.


---

## 17. PROJECT ISOLATION

한 PROJECT의 자산을
다른 PROJECT에 임의로 사용하지 않는다.

예:

`paju_flower/1_model_image`

의 이미지는
파주꽃동산교회 프로젝트 자산이다.

다른 프로젝트에서 사용하려면
사용자의 명시적 지시가 필요하다.

SYSTEM의 공통 Knowledge와 Reference만
모든 프로젝트에서 공유한다.


---

## 18. SCOPE CONTROL

현재 요청에 필요한 작업만 수행한다.

사용자가 요청하지 않은:

- 폴더 구조 변경
- 시스템 확장
- 자동화 추가
- 대규모 리팩터링
- 새로운 서비스 개발
- 기존 파일 삭제

등을 임의로 수행하지 않는다.


---

## 19. PRODUCTION READY

최종 Image Prompt와 I2V Prompt는
설명용 초안이 아니다.

실제 생성 모델에 바로 입력할 수 있는
Production Ready 형태로 작성한다.

실제 생성 프롬프트는
자연스럽고 구체적인 영어를 기본으로 한다.


---

# CORE RULE

`shorts_dir`의 기본 제작 방식은:

**REFERENCE → IMAGE → SEE → MOTION**

이다.

먼저 기준 자산을 확인한다.

좋은 Scene 이미지를 만든다.

실제 생성된 이미지를 직접 본다.

그 이미지에 가장 적합한 움직임만 설계한다.

영상 AI에게
기획, 디자인, 연출을 한 번에 떠넘기지 않는다.

**사람과 시스템이 먼저 결정하고,
AI는 결정된 장면을 실행한다.**