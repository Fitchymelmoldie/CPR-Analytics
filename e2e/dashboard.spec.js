import { test, expect } from '@playwright/test';

test.describe('Dashboard Auth Guard', () => {
  test('shows the secure login screen to unauthenticated users', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'CPR Analytics' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /Secure Login/i })).toBeVisible();
  });
});

test.describe('Dashboard mobile visual smoke', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('keeps the KPI story stable and information surfaces opaque', async ({ page }) => {
    const applicationLogs = [];
    page.on('console', message => {
      const sourceUrl = message.location().url || '';
      const isApplicationSource = !sourceUrl || sourceUrl.startsWith('http://127.0.0.1:4173');
      if (isApplicationSource && (message.type() === 'warning' || message.type() === 'error')) applicationLogs.push(message.text());
    });

    await page.goto('/?layout-preview=1');
    const workspaceSidebar = page.locator('#workspace-sidebar');
    await page.getByRole('button', { name: 'Open workspace' }).click();
    await expect(workspaceSidebar).toBeVisible();
    await expect(workspaceSidebar).toHaveCSS('visibility', 'visible');
    await page.getByRole('button', { name: 'Visual Dashboard', exact: true }).click();
    await expect(workspaceSidebar).toHaveCSS('visibility', 'hidden');

    await page.getByRole('button', { name: /View Completed RO performance/ }).click();

    const story = page.getByRole('dialog', { name: 'Completed RO' });
    const chart = story.locator('[data-responsive-plot="true"]');
    await expect(story).toBeVisible();
    await expect(chart).toBeVisible();

    const chartGeometry = await chart.evaluate(svg => ({
      clientWidth: svg.clientWidth,
      clientHeight: svg.clientHeight,
      viewBoxWidth: svg.viewBox.baseVal.width,
      viewBoxHeight: svg.viewBox.baseVal.height,
      lineDashArray: getComputedStyle(svg.querySelector('[data-testid="trend-line"]')).strokeDasharray,
      linePath: svg.querySelector('[data-testid="trend-line"]').getAttribute('d'),
    }));
    expect(chartGeometry.clientWidth).toBeLessThanOrEqual(340);
    expect(chartGeometry.clientWidth).toBe(chartGeometry.viewBoxWidth);
    expect(chartGeometry.clientHeight).toBe(chartGeometry.viewBoxHeight);
    expect(chartGeometry.lineDashArray).toBe('none');
    expect(chartGeometry.linePath).toContain(' C ');

    await page.getByRole('button', { name: 'Close performance story' }).click();
    await page.getByRole('button', { name: 'Operational KPI guide' }).click();
    const header = page.getByRole('banner');
    const operationalGuide = page.getByRole('tooltip', { name: 'Operational KPI guide details' });
    const [headerBox, guideBox, guideStyles] = await Promise.all([
      header.boundingBox(),
      operationalGuide.boundingBox(),
      operationalGuide.evaluate(element => ({
        backgroundColor: getComputedStyle(element).backgroundColor,
        position: getComputedStyle(element).position,
        zIndex: getComputedStyle(element).zIndex,
      })),
    ]);
    expect(guideStyles).toEqual({ backgroundColor: 'rgb(23, 29, 38)', position: 'absolute', zIndex: '70' });
    expect(guideBox.y).toBeGreaterThanOrEqual(headerBox.y + headerBox.height);

    const businessSnapshot = page.getByRole('region', { name: 'Business snapshot' });
    const customizeCards = page.getByRole('button', { name: /Customize cards/i });
    const dailyGuideLayout = async () => {
      const [snapshotBox, customizeBox, scrollY] = await Promise.all([
        businessSnapshot.boundingBox(),
        customizeCards.boundingBox(),
        page.evaluate(() => window.scrollY),
      ]);
      return {
        snapshot: { ...snapshotBox, y: snapshotBox.y + scrollY },
        customize: { ...customizeBox, y: customizeBox.y + scrollY },
      };
    };
    const layoutBeforeDailyGuide = await dailyGuideLayout();
    await page.getByRole('button', { name: 'How daily actual is calculated' }).hover();
    const actualGuide = page.getByRole('tooltip', { name: 'Daily actual calculation details' });
    const actualGuideStyles = await actualGuide.evaluate(element => ({
      backgroundColor: getComputedStyle(element).backgroundColor,
      position: getComputedStyle(element).position,
    }));
    expect(actualGuideStyles).toEqual({ backgroundColor: 'rgb(23, 25, 28)', position: 'absolute' });
    expect(await dailyGuideLayout()).toEqual(layoutBeforeDailyGuide);

    await page.getByRole('button', { name: 'How daily budget is calculated' }).hover();
    const budgetGuide = page.getByRole('tooltip', { name: 'Daily budget calculation details' });
    const budgetGuideStyles = await budgetGuide.evaluate(element => ({
      backgroundColor: getComputedStyle(element).backgroundColor,
      position: getComputedStyle(element).position,
    }));
    expect(budgetGuideStyles).toEqual({ backgroundColor: 'rgb(23, 25, 28)', position: 'absolute' });
    expect(await dailyGuideLayout()).toEqual(layoutBeforeDailyGuide);

    const overflow = await page.evaluate(() => ({
      document: document.documentElement.scrollWidth - window.innerWidth,
      body: document.body.scrollWidth - window.innerWidth,
    }));
    expect(overflow.document).toBeLessThanOrEqual(0);
    expect(overflow.body).toBeLessThanOrEqual(0);
    expect(applicationLogs).toEqual([]);
  });
});

test.describe('Dashboard release-candidate interactions', () => {
  test('keeps axes, goal lines and selected-month callouts logically coherent', async ({ page }) => {
    await page.goto('/?layout-preview=1');
    const metrics = [
      'Completed RO',
      'Paint Cost / RO',
      'Paint Cost / Total Sales',
      'VPD / Per Booth',
      'Booth Cycle Time',
      'Return on Paint Labour',
      'Liquid Cost to Refinish',
      'Paint Revenue P/V'
    ];

    for (const metric of metrics) {
      await page.getByRole('button', { name: `View ${metric} performance` }).click();
      const dialog = page.getByRole('dialog', { name: metric });
      const svg = dialog.locator('[data-responsive-plot="true"]');
      const tickValues = await dialog.getByTestId('y-axis-tick').evaluateAll(ticks => ticks.map(tick => Number(tick.getAttribute('data-axis-value'))));
      expect(tickValues.length).toBeGreaterThanOrEqual(4);
      expect(tickValues.length).toBeLessThanOrEqual(6);
      const tickSteps = tickValues.slice(1).map((value, index) => Number((tickValues[index] - value).toFixed(8)));
      expect(new Set(tickSteps).size).toBe(1);
      expect(tickSteps[0]).toBeGreaterThan(0);

      await expect(dialog.getByTestId('chart-legend')).toContainText('Monthly actual');
      await expect(dialog.getByTestId('chart-legend')).toContainText('Goal');
      await expect(dialog.getByTestId('target-annotation').locator('rect')).toHaveCount(0);

      const staticGeometry = await svg.evaluate(element => {
        const box = node => {
          const value = node.getBoundingClientRect();
          return { left: value.left, right: value.right, top: value.top, bottom: value.bottom };
        };
        const overlaps = (first, second) => first.left < second.right && first.right > second.left && first.top < second.bottom && first.bottom > second.top;
        const labels = [...element.querySelectorAll('[data-testid="trend-label"]')].map(box);
        const hits = [...element.querySelectorAll('[data-testid="point-hit-area"]')].map(node => ({ x: Number(node.getAttribute('x')), width: Number(node.getAttribute('width')) }));
        const xAxis = element.querySelector('[data-testid="x-axis-line"]');
        const plotLeft = Number(xAxis.getAttribute('x1'));
        const plotRight = Number(xAxis.getAttribute('x2'));
        const cursors = [
          getComputedStyle(element).cursor,
          getComputedStyle(element.querySelector('[data-testid="trend-line"]')).cursor,
          ...[...element.querySelectorAll('[data-testid="trend-point"]')].map(node => getComputedStyle(node).cursor),
          ...[...element.querySelectorAll('[data-testid="point-hit-area"]')].map(node => getComputedStyle(node).cursor)
        ];
        return {
          xLabelsOverlap: labels.some((label, index) => labels.slice(index + 1).some(other => overlaps(label, other))),
          hitAreasOverlap: hits.some((hit, index) => hits.slice(index + 1).some(other => (
            hit.x < other.x + other.width - 0.01 && hit.x + hit.width > other.x + 0.01
          ))),
          hitAreasHaveGaps: hits.slice(1).some((hit, index) => Math.abs(hits[index].x + hits[index].width - hit.x) > 0.01),
          hitAreasCoverPlot: Math.abs(hits[0].x - plotLeft) <= 0.01 && Math.abs(hits.at(-1).x + hits.at(-1).width - plotRight) <= 0.01,
          cursorIsStable: cursors.every(cursor => cursor === 'crosshair')
        };
      });
      expect(staticGeometry).toEqual({
        xLabelsOverlap: false,
        hitAreasOverlap: false,
        hitAreasHaveGaps: false,
        hitAreasCoverPlot: true,
        cursorIsStable: true
      });

      const points = dialog.getByTestId('trend-point');
      const readout = dialog.getByTestId('selected-point-readout');
      await expect(points.locator('title')).toHaveCount(0);
      await points.first().hover();
      await expect(readout).toHaveAttribute('data-interaction', 'preview');
      await dialog.getByTestId('chart-legend').hover();
      await expect(readout).toHaveCount(0);

      await points.first().focus();
      await expect(readout).toHaveAttribute('data-interaction', 'preview');
      await dialog.getByRole('button', { name: 'Close performance story' }).focus();
      await expect(readout).toHaveCount(0);

      for (let index = 0; index < await points.count(); index += 1) {
        await points.nth(index).dispatchEvent('click');
        await expect(readout).toHaveAttribute('data-interaction', 'pinned');
        const calloutGeometry = await svg.evaluate(element => {
          const viewBox = element.getAttribute('viewBox').split(' ').map(Number);
          const callout = element.querySelector('[data-testid="selected-point-readout"] rect');
          const target = element.querySelector('[data-testid="target-line"]');
          const x = Number(callout.getAttribute('x'));
          const y = Number(callout.getAttribute('y'));
          const width = Number(callout.getAttribute('width'));
          const height = Number(callout.getAttribute('height'));
          const targetY = Number(target.getAttribute('y1'));
          return {
            within: x >= 0 && y >= 0 && x + width <= viewBox[2] && y + height <= viewBox[3],
            crossesTarget: targetY >= y && targetY <= y + height,
            compact: height === 30 && width <= 140
          };
        });
        expect(calloutGeometry, `${metric} point ${index + 1}`).toEqual({ within: true, crossesTarget: false, compact: true });
      }

      await dialog.getByRole('button', { name: 'Close performance story' }).click();
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: 'View Completed RO performance' }).click();
    const mobileDialog = page.getByRole('dialog', { name: 'Completed RO' });
    const mobileLabels = await mobileDialog.getByTestId('trend-label').allTextContents();
    expect(mobileLabels.length).toBeLessThanOrEqual(5);
    expect(mobileLabels[0]).toMatch(/’26$/);
    expect(await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth)).toBeLessThanOrEqual(0);
  });

  test('lands dragged KPI cards at the indicated insertion edge', async ({ page }) => {
    await page.goto('/?layout-preview=1');
    await page.getByRole('button', { name: /Customize cards/ }).click();
    await page.waitForTimeout(500);

    const grid = page.getByRole('region', { name: 'Dashboard KPI cards' });
    const cardTitles = () => grid.locator('article > button').evaluateAll(buttons => buttons.map(button => button.getAttribute('aria-label')?.match(/^View (.*?) performance/)?.[1]));
    const completedHandle = grid.getByTitle('Drag Completed RO to a new position');
    const paintRatioCard = grid.getByRole('button', { name: /View Paint Cost \/ Total Sales performance/i }).locator('..');
    const paintRatioBox = await paintRatioCard.boundingBox();

    await completedHandle.dragTo(paintRatioCard, {
      targetPosition: { x: paintRatioBox.width * 0.75, y: paintRatioBox.height / 2 }
    });
    await expect.poll(async () => {
      const currentTitles = await cardTitles();
      return currentTitles.indexOf('Completed RO') - currentTitles.indexOf('Paint Cost / Total Sales');
    }).toBe(1);
    let titles = await cardTitles();
    expect(titles.indexOf('Completed RO')).toBe(titles.indexOf('Paint Cost / Total Sales') + 1);

    const movedHandle = grid.getByTitle('Drag Completed RO to a new position');
    const paintCostCard = grid.getByRole('button', { name: /View Paint Cost \/ RO performance/i }).locator('..');
    const paintCostBox = await paintCostCard.boundingBox();
    await movedHandle.dragTo(paintCostCard, {
      targetPosition: { x: paintCostBox.width * 0.25, y: paintCostBox.height / 2 }
    });
    titles = await cardTitles();
    expect(titles.indexOf('Completed RO')).toBe(titles.indexOf('Paint Cost / RO') - 1);

    await page.setViewportSize({ width: 390, height: 844 });
    const drawer = page.getByRole('complementary', { name: 'Metric library' });
    await drawer.getByRole('button', { name: 'Move Completed RO later in dashboard order' }).click();
    titles = await cardTitles();
    expect(titles.indexOf('Completed RO')).toBe(titles.indexOf('Paint Cost / RO') + 1);
    expect(await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth)).toBeLessThanOrEqual(0);
  });

  test('keeps graph filters, reporting periods, reviews and workspaces consistent', async ({ page }) => {
    const applicationLogs = [];
    page.on('console', message => {
      const sourceUrl = message.location().url || '';
      const isApplicationSource = !sourceUrl || sourceUrl.startsWith('http://127.0.0.1:4173');
      if (isApplicationSource && (message.type() === 'warning' || message.type() === 'error')) applicationLogs.push(message.text());
    });

    await page.goto('/?layout-preview=1');
    await page.getByRole('button', { name: /View Completed RO performance/ }).click();
    const story = page.getByRole('dialog', { name: 'Completed RO' });
    const points = story.getByTestId('trend-point');

    await expect(points).toHaveCount(8);
    await story.getByRole('button', { name: '3M', exact: true }).click();
    await expect(points).toHaveCount(3);
    await story.getByRole('button', { name: '6M', exact: true }).click();
    await expect(points).toHaveCount(6);
    await story.getByRole('button', { name: 'FYTD', exact: true }).click();
    await expect(points).toHaveCount(2);

    await story.getByRole('button', { name: 'Custom', exact: true }).click();
    const customRange = story.getByRole('dialog', { name: 'Custom graph range' });
    await customRange.getByLabel('From month').selectOption('2026-02');
    await customRange.getByLabel('To month').selectOption('2026-05');
    await expect(points).toHaveCount(2);
    await customRange.getByRole('button', { name: 'Apply' }).click();
    await expect(points).toHaveCount(4);
    await expect(story.getByTestId('active-graph-range')).toContainText('4 months · Feb 2026 to May 2026');

    await page.getByRole('button', { name: 'Close performance story' }).click();
    await page.getByRole('combobox', { name: 'Reporting period' }).click();
    await page.getByRole('option', { name: 'Jan 2026' }).click();
    await page.getByRole('button', { name: /View Completed RO performance/ }).click();
    await expect(story.getByRole('button', { name: '12M', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(points).toHaveCount(1);
    await expect(story.getByTestId('active-graph-range')).toHaveText('1 month · Jan 2026');
    await page.getByRole('button', { name: 'Close performance story' }).click();

    await page.getByRole('button', { name: 'Consultant Reviews' }).click();
    const review = page.getByRole('dialog', { name: 'Consultant Review' });
    await expect(review.getByLabel('Consultant review period')).toHaveValue('2026-08');
    await expect(review.getByRole('option', { name: 'Aug 2026' })).toHaveAttribute('value', '2026-08');
    await page.keyboard.press('Escape');
    await expect(review).toBeHidden();

    const workspaceChecks = [
      ['Shop Profile', 'Boyle Smash Repairs'],
      ['Data & Imports', 'Import CSV spreadsheet'],
      ['Customer Management', 'Customer Management'],
    ];
    for (const [navigationName, headingName] of workspaceChecks) {
      await page.getByRole('button', { name: navigationName, exact: true }).click();
      await expect(page.getByRole('heading', { name: headingName }).first()).toBeVisible();
      const overflow = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    }

    expect(applicationLogs).toEqual([]);
  });
});
