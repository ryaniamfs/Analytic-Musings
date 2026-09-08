---
layout: post
title: Football Analytics Ideas
category: FA
date: 2026-05-26
---

> **Status — May 2026.** I am building out my data pipelines/datasets/scrapers first, which are almost done (though they will expand on a rolling basis as I have more ideas). I am then going to do signal research to test the ideas below. My aim is to start by 26/27 (aka September), fundamental 2x1 across the big 5 leagues. So the research and backtesting will be done across the World Cup and pre-season.

## Overview

What are we doing? We are observing patterns that happen in situations. We then ask, how can we generalize or quantify this pattern? Can we model it?

For football analytics, I believe there are 3 main problems:

* **Overlapping effects** — When we see some outcome or effect in football, we know there are a myriad of contributing factors. The question is how to orthogonalize out effects we know to isolate the idiosyncratic return. For example, consider the problem of assessing managers.
* **Counterfactuals (Neyman-Rubin)** — When we look at stats, they are context dependent (see the first point). The team affects the player's stats and the player's individual contributions affect the team.
* **The Eye Test** — How do we quantify what we see with our eyes into statistics? And vice versa?

## Results Betting

The core would be a **predictive model** that takes in features and outputs signals/predictions, feeding into another **trading layer (risk management/bet sizing)** plus a discretionary layer of adjustments (e.g. from watching games and reading fan forums to understand the situation) to output trades, and we **rebalance/bet weekly**.

The key idea is: how much signal does past information of football matches have in the outcome of the next match?

The core problem is: how do we translate football wisdom or tropes into statistical signals? Tropes that we see play out in matches, before games, across seasons etc. From being a dedicated fan of a team.

The bottom line is, I believe we can see with our eyes and common sense that there are certain things that affect the outcomes of matches. We can observe certain **narratives** or **subplots** playing out over the course of a season. My question is: can they be quantified?

## Modelling Problems

### Outliers and Anti-Narratives

A team projected to perform well at the start of a season chokes. Tottenham this season, Liverpool this season. Vice versa: the Bournemouth bull run, and in the past the Leicester bull run. These are outliers.

How do you account for outliers in a model? My guess is, if you can't predict them, then don't fight against them. Let the model pick it up and ride the trend. A good test for any model is how well it picks up on the anti-narratives or outliers playing out in real time. For example, if you see the fan channels in 25/26 pre-season, everyone and their mother was glazing Liverpool. Wirtz and Isak are going to destroy the league! Literally nobody could have predicted this. Just like 100 days into the war and oil at 90s... who would have thought?

So a model needs to be able to identify these anti-narratives happening in real time and pick up on the trend.

### Cold Start

* **Seed from last season** — Any points/league weighted feature suffers from the lack of data at the start of a season. Use a weighting scheme from the past season.
* **Problem** — Plus take into account squad value? Difficult due to lookahead bias of squad/wages.

### Team Strength

Any summarized match/game metric is inflated or deflated by the delta of team strength. For example, a strong team is naturally expected to generate high xG against a weaker team.

### Game State Weighting

Any summarized match/game metric like xG/xA, PPDA, field tilt or xT is aggregated. These variables fluctuate by game state, so we need time series metrics within the game to weigh these metrics. For example, a team going 2-0 up and dominating on xG will sit back in the 70th while the opposing team attacks more.

Candidate within-game proxies:

* Sofascore's attacking momentum time series chart.
* Possession/field tilt time series.
* Score timings, if we can't get time series possession or field tilt.

### XI Release Timing

Do you go in before the XI is released or right after? You can have two variants of timings/approaches, where in the former you take injuries to forecast availability. Or you can wait for the XI to release, have that information, and then go in.

If you price XI information better than the market, then you should go in after. So there are two timing approaches for any fundamental strategy. Which one makes more money?

### Counterexamples

No matter how much you can find a trend or signal, there are always counterexamples. E.g. the transfer coefficient: Wirtz vs De Bruyne, BuLi CAM to EPL. One flops, the other becomes a legend.

## Features

Twelve features, grouped by what they try to isolate.

| Feature | What it captures | Main input |
| --- | --- | --- |
| [Core Strength](#core-strength) | Season-stable squad and manager strength | Past position/points, squad value, transfers in and out |
| [Momentum](#momentum) | Short-window xG vs goal-difference over/underperformance | Match xG and goals, adjusted for opponent and game state |
| [Style](#style) | Style matchups that neutralize raw strength gaps | Match aggregate stats, squad attributes |
| [Player Selection](#player-selection) | Alpha in the chosen XI relative to the theoretical ideal XI | Historical player ratings, algo and journalist |
| [Availability and Injury](#availability-and-injury) | Importance of missing players and replacement quality | Injury lists, historical player ratings |
| [Manager](#manager) | Manager alpha, H2H records, style tendencies | Tenure results, wages/net spend, past fixtures |
| [Fatigue, Congestion and Rotation](#fatigue-congestion-and-rotation) | Performance decay from schedule density and low rotation | Fixture count, distance run, minutes dispersion |
| [Motivation](#motivation) | Incentive differentials late in a season | League position, games remaining |
| [Home and Away](#home-and-away) | Team-specific home/away advantage | Points/league-weighted home vs away splits |
| [Referee](#referee) | Referee bias toward or against certain teams | Past fixtures by referee |
| [Informed Fan](#informed-fan) | Sharp fan sentiment, especially on lineup release | Reddit, X and Instagram text |
| [Bookie Odds](#bookie-odds) | The market prior as shrinkage (the Benter boost) | Opening/closing odds, odds dispersion |

### Core Strength

**Squad strength is season-stable** — The fundamental feature at the start of each season: a team has an innate ranking/strength level from its players and the manager. This should remain relatively stable across the season.

**Equation** — `core_strength(team) = baseline + differential`, where baseline is existing squad strength last season and differential is the ex-ante expected contribution/strength of incomings less the ex-post contribution/strength of outgoings.

**Evaluation** — In-season outcomes and baseline win rates/odds (not residual odds), since this is a "beta" feature, not "alpha".

* **Modelling** — All separate features (e.g. their own units/dimensions) or single (better for interpretation but harder to do).
* **Baseline** — Past squad strength. Past position/points, squad value, strength scores, etc.
* **Differential** — Strength of incomings (aka the [ex-ante transfer problem](#the-playertransfer-problem)) and strength of outgoings (this is ex-post).
* **Spending Power** — Within league relative or past-position relative (for this position, say midtable, how much is usually spent?), total spent or net spend.
* **Incomings** — I talk about possible approaches to the [ex-ante transfer problem](#the-playertransfer-problem) below. For ex-ante, we have market value, prices, player ratings at past clubs. But...
* **Outgoings** — Relative player performance per game, accumulated across a season, scaled to baseline or points as a measure of contribution.

**Problem** — Both baseline and differential (ins and outs) must be comparable within league and in the same units! In other words, the relative strength of incomings at Liverpool must be comparable to the relative strength of incomings at Bournemouth, for example. Same for relative strength of outgoings at Liverpool and Bournemouth.

> **Example.** Liverpool's 25/26 window summed it up. Losing Darwin, Diaz, Trent and Jota (RIP), replacing them with Frimpong, Kerkez, Wirtz, Ekitike and Isak. Combined with Salah's underperformance, the replacements in reality just failed to fill the gaps of the leavers. They had a high baseline, but such a huge negative differential (weak ins and strong outs) that it hurt their core strength badly. The question is how we quantify that. Remember: consensus ex-ante 25/26 was that the ins were really, really strong.

### Momentum

**Luck is unsustainable** — A team that overperforms xG diff over goal diff should be winning more, and a team that underperforms xG diff over goal diff should be winning less. Aka a short window (e.g. simple/exponential MA) of diffs.

**Three adjustments to xG** — xG must be adjusted for team strength factor, game state factor, and structural factor (systematic over/underperformance). The latter can be done by estimating a long window of diffs.

* **xG Over/Underperformance of Goal Diff** — Window of league/point-weighted, game-state-weighted goal differentials. Some teams structurally over- or underperform their xG, based on style factors (need to research this) or just player power (e.g. outrageous goals like PSG).
* **Team Strength Delta Factor** — Marginal xG value varies in opponent strength. Scale the xG difference by team strength deltas, to account for team strength differences.
* **Game State Weighting Factor** — Marginal xG value varies in time. E.g. for goals, scale them by goal timing: 2-0 with 90' and 95' is not the same as 2-0 with 30' and 40'. For xG, create a discretized xG curve and apply a time decay. Or Sofascore attacking momentum.
* **Structural Factor** — Marginal xG value can vary due to structural over/underperformance. E.g. a team with deadly finishers and long shot specialists can consistently score low xG goals and overperform. A team with bad finishers can underperform.

### Style

**Styles counter styles** — Certain teams' styles, e.g. high pressing, possession, counterattack, can neutralize or be (dis)advantaged versus another style.

**Style can overpower strength** — The matchup more or less overpowers any strength-difference features to produce a contrarian result that is "unexpected". We will use match aggregate statistics for this. But it is subject to the [game state problem](#game-state-weighting): a match statistic is aggregated across the game state time series.

**Confounding with Game State** — Styles can change within a match. For example, a team might switch from high pressing to sitting back after taking a 2-0 lead.

**Confounding with Opponent** — This is a bigger factor, as a team might play different styles versus different opponents! For example, a relegation team might play a low block to frustrate a much stronger opponent (because they simply don't have the skill to play attacking football against a stronger team) and come away with a narrow draw. But the same team, facing a less strong opponent, say midtable, might open up and lose because of that.

**Bogey Team Trope** — The football trope of a "bogey team" seems to imply the existence of style advantage and disadvantage. A comment from ["Why is Spurs of all teams our Kryptonite" on Reddit](https://www.reddit.com/r/MCFC/comments/1ip9wuk/why_is_spurs_of_all_teams_our_kryptonite_cant/) says "Rock Paper Scissors innit". There must be some wisdom in this trope if fans latently express it.

* **Player/Team Balance** — **Midfield balance** (creativity, control, defensive awareness). No defensive awareness leads to susceptibility to conceding and fast transitions. No creativity leads to an inability to break down low blocks.
* **Style Negation/Aggravation (SNA)** — Certain teams might be good at overcoming style mismatches. For example, a low block could be broken if a team has lots of verticality, dribblers, longshot specialists, midfielders that break lines/take risks, or a target man to spam crosses into. A team might be good at preventing counterattacks simply by having a world class DM with pace that can sweep up, e.g. Declan Rice.

Concrete mismatches:

> **Counterattack/Transition vs Possession/Pressing.** Matchups of City vs Spurs (GW12 24/25, 23-11-24, 4-0) and United vs City (GW21 25/26, 17-01-26, 2-0) come to mind. *SNA*: made worse by an attacking minded, slow midfield against fast attackers.

> **Low Block vs Dominant Team.** Many of Arsenal's games in 25/26 come to mind. Sunderland vs Arsenal (GW11 25/26, 08-11-25, 2-2). This happens often when a stronger team plays a weak team. The weak team sets up shop. The metrics then look very lopsided as the strong team just batters the weak team's low block, and the margin of victory, if any, becomes much closer than the underlying stats suggest. See Burnley vs Liverpool (GW4 25/26, 04-09-25, 0-1). *SNA*: the amount of creative dribbling/dribblers to get past blocks, and the verticality/progressiveness of the midfielders in terms of their passing.

> **Crossing/Set Piece Vulnerability.** Can't think of an example for this. *SNA*: height difference in teams (certain distributions of height amongst positions may matter more), say a crossing dominant team against opponent backline height.

**Residual Analysis** — Once we have a good model without style, back out any strange or outlier results and infer the style mismatch from them. Problem: this needs a decent model first, and outlier matches may not be due to style mismatch.

### Player Selection

**Managers don't always pick the best XI** — How much alpha there is in picking the selected starting XI and subs for that opponent, relative to the theoretical ideal/maximum starting XI and subs.

**Why player ratings, for now** — These are all (creative) functions of player ratings, assuming they are indicative of performance and that past performance carries into future performance. Player ratings are proprietary functions of events/tracking data in the algo sense, and journalist human views (eye tests). We use ratings, for now, because we do not have detailed events data, nor do we have a view on how to process events/tracking data to assess performance better than the ratings providers.

**Ratings** — Use historical player ratings to measure effectiveness of the XI. Statistical/algo ratings vs journal ratings.

Variants:

* **Weight new transfers more**, as existing players already have a baseline strength from last season.
* **Weight recent form more vs past historical form** (e.g. past seasons' ratings with large $n$). Important for players who aren't nailed-on starters (aka Skelly in midfield banged vs Fulham replacing Zubimendi, but was poorly rated at LB in the past).
* **Weight z-scores by position group** (attackers, midfielders, defenders, GK). Relative performance to your position group instead of your squad.
* **Weight journal vs algo.** How much weight do you put in a journalist view vs an algo view? Stat padders might get artificially boosted by algos (see Gyokeres in Arsenal vs Atletico, UCL semi first leg 25/26, rated highly by BBC/Sky and fans but poorly by the algorithm. Not good.)
* **Theoretical ideal lineup construction algorithm.** Player position placement matters too! Sometimes fans complain when the manager plays the player in the wrong position. E.g. when Zubimendi was failing, Arteta caved in to what us fans had been crying out for and shifted MLS from LB to CM. This led us to a title win and UCL final. So in other words, Skelly playing in CM boosted his player performance, in his natural position.

**Out-of-Position Index** — Penalize managers for playing players out of position. This means we need to detect how much to penalize per player, and have a view on how well each player performs per position usually. And out-of-sample (aka new tryout matches) need to be weighed! Say a player is played OOP for the first time this season. How do we price that?

### Availability and Injury

**Injuries cost points** — In theory, injuries to key players can damage outcomes. AFCON is basically an injury.

**Why not just use player selection** — This should be captured in [player selection](#player-selection), but what if the ratings price a key player lower?

**Injury Separation from Player Selection** — For that reason, we should have an injury feature that quantifies the importance of injured players. And we would use player ratings over historical seasons (if there are any) to get this importance. What if it's a new transfer?

**Replacement Quality Problem** — In theory, a separate injury score and a player selection feature should solve the problem of the injury replacement quality option. In other words, the quality of the replacement can mitigate or exacerbate the injury loss.

> **Example.** When Ruben Dias got injured, City brought in Max Alleyne and choked out some losses on the tape before bringing Guehi in January. Arsenal's Saliba injury in 22/23, where Rob Holding stepped up, caused a title collapse.

### Manager

**Manager Alpha** — We know some managers are good. For example, Carrick in 25/26 took United to top 4 after a horrible Amorim bear run. But to what extent does past manager performance carry over, from cross-league? Similar to the [transfer-in problem](#the-playertransfer-problem).

**H2H** — Some kind of H2H manager score based on past fixtures over a long period with the same team. The hypothesis being that certain managers just tactically have each other's number.

**Manager Styles** — Some managers have styles, e.g. Postecoglou's high line, Arteta's 25/26 defense. They have a system. The problem is that systems change over time and also against opponent. E.g. in 22/23 Arteta played very attacking football, but in 24/25 and 25/26 he took it to a defensive extreme. So styles may change over time too. Maybe one should infer style from a rolling window, conditioned on opponent strength. This is tricky, but links manager to [style factor](#style).

### Fatigue, Congestion and Rotation

**Congestion degrades performance** — Playing too many games in a tight schedule does impact performance versus being well-rested.

* **Team Fatigue** — Team level fatigue from tight schedules, low rotation etc. Links to [injury/unavailability factors](#availability-and-injury).
* **Player Level Fatigue** — The idea being a drop in performance of players due to burnout can impact results. Links to [player selection](#player-selection) and [injury/unavailability factors](#availability-and-injury).
* **Candidate inputs** — Fixture count, distance run, pressing intensity, degree of rotation/substitutions, minutes played dispersion. These all impact fatigue, especially deep in cup runs. It kind of kicks in the last months of a season with a drastic collapse. Hence the birth of the April collapse.

**Example** — Need to find examples where teams bust a gut early in the season and then collapse towards the tail end (e.g. the Arteta and Klopp Arsenal April collapses). Usually accompanied by a congested schedule and injury pileup.

### Motivation

**Incentives diverge late in the season** — Some kind of motivation score differential. Nearing the end of the season, say the last 5 games (GW34), we have teams with increased and decreased motivation.

**Construction** — Some kind of score that increases or decreases depending on the position in the table and number of games left.

Examples:

* Relegation teams fighting at the end of the season.
* Mid table teams with no ability to leapfrog in the table, or who cannot qualify for the next tier competition (CL, UEL, Conference).
* Title winners having won already at the end of the season, with no motivation. Doesn't happen often in the EPL though, unlike BL or L1.
* Sometimes teams with nothing to play for rest players for a big game.

### Home and Away

**Construction** — A home team score and an away team score.

**Home advantage is team-specific** — Certain teams have more home/away advantage than others. Andrew Mack's SSMIE book talks about a ZSD model for this. Window of points/league weighted home points vs away points difference.

**Example** — Interaction effect with the [referee](#referee): we know sometimes referees get swayed by the home crowd and skew decisions.

### Referee

Some kind of league/point-weighted referee score based on past fixtures over a long period of time with the same team. The idea being that sometimes referees have biases against certain teams.

### Informed Fan

**Sharps vs Noise Fans** — With any text based dataset, there will be informed, sharp fans who have accurate views about the game. There will also be fans who get it completely wrong. How can we separate the two?

**Pre-match sentiment** — For bookie upsets and high sharp logloss matches from our dashboard, we can flag these matches ex-post. We can scan pre-match threads ex-ante, or daily discussion threads, to get a sense of what fans are thinking about the chances for those outlier/high logloss games.

**Starting XI reaction sentiment** — For example, a bad lineup comes out. Fans on X, or the pre-match thread, or the lineup thread, complaining. How do I know? Because I would go immediately to the lineup and start complaining... or at least I would go there to see if other people are complaining.

* **Club XI posts as a data source** — Official club pages will always release the XI on X and Instagram. Does the data there have any predictive power as a signal? Perhaps some kind of sentiment score, on Instagram and X.
* **As an odds adjustment** — Sentiment score differential against closing odds residual. Or some kind of discount adjustment to the final prediction odds.
* **Crowd view on lineup alpha** — Effectively the wisdom of the crowd applied to the [starting XI alpha feature](#player-selection). For example, if fans think it is a bad lineup choice, they will be complaining in the release thread.

### Bookie Odds

**The Benter boost** — As per Mack. Benter in his paper blended his odds/probs with bookie odds/probs in a logit model. Acts as a form of regularization/shrinkage.

**Other angles to test** — Odds dispersion, wrongness, opening vs closing delta. Need to do EDA on odds. Odds time series from bettingiscool (49 euro/month).

## Feature Interaction

[Style factors](#style) represent a style that is directed by the manager for the starting XI to execute. However it interacts with [player selection](#player-selection): certain players are responsible for implementing or neutralizing a style. For example, a destroyer like Caicedo or Rice for a possession team prevents a counterattacking team from executing effectively.

Style factors also interact with [home and away](#home-and-away). In general, home teams tend to want to dominate and have more possession. Not always the case though.

## Open Problems: The Discretionary Angle

### The Player/Transfer Problem

**Pricing incomings** — How much strength do incoming players contribute to core squad strength?

> **Example.** Kvara signed in Jan 24/25 for PSG for 70m euros. He then made a HUGE impact in PSG for the 24/25 and 25/26 CL runs, responsible for their CL dominance.

> **Example.** Wirtz signed in July for 25/26 for Liverpool for 120m euros. He then played a HUGE role in flopping (Flopian Wirtz as they call him) and is a reason why Liverpool sucked in 25/26. He couldn't cut it. A 120m budget would score high in our feature.

* **Opponent-strength weighted average player ratings** — If we have past WhoScored ratings, we can discount them for opponent strength. Inspired by the -7 Wirtz comment. However, the problem is we need to adjust by league position and league strength!
* **Transfer Coefficient** — Some have suggested a "transfer coefficient" plus UEFA coefficients.
* **Discretionary Blend** — Scout the transfers and assign a score to each squad. Then apply that to a transfer score across summer/winter. Make intentional lookahead bias by forming the transfer score feature for teams by looking at ex-post EOS grades (e.g. market value). Test if it improves performance. Then if live season, scout and make discretionary scores from YouTube.
* **On the Fly Weighting** — Move the transfer problem into the [player selection feature](#player-selection). Heavily weigh the new signings' ratings more in the strength of squad.
* **Styles** — For a certain position, for a transfer from league X to Y, maybe styles have to do with it? In other words, the attributes of the player. Then we can use FIFA/EAFC ratings to quantify (e.g. weak and slow usually does not translate to the PL). But this is a big stretch so... I really doubt there is any signal in fricking FIFA ratings.

**The Wirtz Problem** — If you check [this link](https://www.reddit.com/r/soccer/comments/1l89qfn/romano_florian_wirtz_to_liverpool_here_we_go/), you have fans glazing that mfer. But scroll down, at -7 downvotes, a comment says:

> He has good league numbers, but most of his production came against teams like Bremen, Freiburg, and Wolfsburg. He was disappointing in the Europa league final as well as the Euros. In last two seasons he hasn't scored or assisted against Bayern in the league as well. Then in UCL didn't play well vs Atleti, Liverpool, Bayern, with his best perfs against Brest and Feyenoord.

At -7. So this guy has successfully, ex-ante, made the Wirtz call. The footballing equivalent of calling the US/Iran MoU in April during peak oil. This comment says he doesn't show up in big games, therefore flop. Now this gets me thinking... can we quantify this?

### Other Factors Influencing Transfers (Not Modellable)

* **Manager Misprofiling** — Manager misprofiles a player. Uses him in a role/position he is not suited to. Poor management.
* **Poor Tactical Fit** — Player struggles to adapt into a new tactical system. This in theory is modellable, but it means we need to model tactics/styles for all clubs that transfer into the big 5! Crazy stuff.
* **Homesickness/Culture Fit** — Player struggles to adapt to playing in a foreign culture. See Angel Di Maria to United under Van Gaal, 14/15 season.

### The Manager Problem

**Managers have alpha and beta** — Quantifying manager performance. Alpha being their idio return and beta being their factor returns (current squad, budget, support). Can we isolate the alpha or idio returns of each manager, netting off the effects of their current squad wages and net spend over their tenure?

**Residuals reveal skill** — Regress wages and net spend on league position, across all leagues in cross section, across multiple seasons. If a manager consistently has a high ranked residual, across tenures, then you have to say maybe... that's the skill.

**Recompute alpha point-in-time** — However, it is important to remember that when you include managerial alpha in the model, the alpha must be re-calculated to exclude everything after and including the current season you are modelling! If not, lookahead bias.

**Problem** — This does not take into account the intrinsic value of transfers over or under their budget. E.g. was Iraola carrying Bournemouth or was Rayan carrying Iraola?

## Research Directions

### Correlation Directions

* **Correlative research** — Standard signal/model research. Based on a hypothesis, quantify the hypothesis, test the idea. Is there predictive power?
* **Anti-correlative research** — Find situations/matches where the feature or model (be it yours or the bookie's) failed or diverged dramatically. Then do investigative research. What happened there? Could the feature/model have priced it in? If so, what did we miss? If not, how can we neutralize this risk?

### Correlation Types

* **Season correlations** — For season-level features, we have the extra option of scattering against season outcomes (e.g. points or league ranking).
* **Fixture correlations** — Where we take the difference in two scores of a feature for home and away and use that as a predictor of win probabilities.

### Discretionary Research

* **Discretionary Overlay** — For the EPL, since I'm an Arsenal fan anyway, I might extend to watch all EPL games and understand what the fans of each club are thinking at each point in time across a season. Then I would consider doing a semi-systematic blend with discretionary betting. Aka I watch games, read fan forums, form my views, and also use my model outputs in a discretionary way to inform betting decisions.
* **Transfer Scouting** — Good old YouTube scouting to tell if a transfer prospect is any good.
* **Game Watching** — Obviously, we will aim to watch as many games as possible. I can cover the EPL and watch every game, but to cover the big 5 is a stretch.
* **Fan forums and media** — Reddits, forums etc. It is important to keep track of what the fans are saying, how they complain about lineup choices, what they think of transfers, and how they think the team or players performed in a game.

**Limitation** — Breadth in the cross section is problematic. I probably only have time to cover one league extensively. Fan forums in non-English is a challenge also.

## Modelling Directions

### Setup

**Rolling window** — In this approach, the season-fixed features like manager skill and core strength would remain constant as the season goes on, but in theory the model should naturally weigh them less as the season progresses. A rolling window does this.

However, for a short rolling window, first time effects like a style mismatch will not have any past data to predict or learn on. So the minimum needs to be one full season, then an expanding window. After round robin, aka GW19, we can switch to rolling/expanding on the current season.

**Train-Val-Test** — Not really a big fan of this...

### Feature Construction

**Aggregation/score rollup vs individual** — What if, instead of putting features in individually, we come out with a score/index from modelling groups of features, then feed it into the final model?

* **Interpretability** — Much better, and closer to what we see on the pitch.
* **Rollup scores** — Manager score, squad strength score (baseline plus differential), momentum/form score, player selection/injury score, fatigue/congestion score, style score.
* **Attribution** — E.g. lose game because of big injuries. Lose game because of looking tired in the 2nd half due to season-accumulating fatigue. Lose game because tactically outmatched by a style.

## Non-Betting Ideas

### Player Assessment with Stats

How do we optimally make use of statistics to scout players? Say, examine successful players per position: take a look at their stats and extrapolate to scout new players. Like factors driving returns.

* Find a measure of player success per position. E.g. market value/wages normalized by age, or highest market value increase.
* For the most successful and least successful players, find the statistics that impact that the most.
* Can be used as a scouting tool for transfers by just looking at statistics.

More detailed plan:

* Determine a target variable that is a proxy of player success. For each starting age/year of birth, for each position, for each year, sort players by highest increase in market values forward over the next $t$ years.
* Have some treatment for the statistics per player on a team/league level, to take into account the influence of team and league on statistics. Aka orthogonalize out against the team/league factors. E.g. Wirtz playing in B04, an attacking team, in a farmers league (BuLi).
* Regress residualized statistics across years/seasons against target.
* Take the statistics with the most impact / highest coefficients.

Problems:

* Finding the right dependent variable is difficult. There are many ways to construct it.
* Statistics generated by players in matches are dependent on their team and league. For example, the argument that Portuguese league strikers score tonnes of goals but flop in the higher leagues when they transfer.

### Player Assessment with Physical Attributes

Are there optimal physical metrics per position (arm movement, touch density, leg to torso, torso uprightness) that can determine a player's success in scouting? This relates to the eye test. For example, we can see Messi clearly has some interesting different physical attributes when he plays that contribute to his success. But how to quantify these in numbers is a problem.

### Injuries

Can we predict which teams get the most injuries?

* Run a regression with distance run and total substitute minutes on injury time per season.
* Should be able to prove that better substitute management results in fewer injuries.
