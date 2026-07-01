import api from '../api/axios';

/**
 * Download CSV file of all user workout logs
 */
export const exportWorkoutCSV = async () => {
  try {
    const res = await api.get('/sessions?limit=1000');
    const sessions = res.data;

    if (!sessions || sessions.length === 0) {
      alert('No workout sessions found to export!');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,Date,Exercise,Set,Weight,Reps,Notes\n';

    sessions.forEach((s) => {
      const dateStr = new Date(s.date).toISOString().split('T')[0];
      const exerciseName = s.exerciseId?.name || 'Workout';
      const notes = (s.notes || '').replace(/"/g, '""');

      if (s.sets && s.sets.length > 0) {
        s.sets.forEach((set, index) => {
          csvContent += `"${dateStr}","${exerciseName}",${index + 1},${set.weight},${set.reps},"${notes}"\n`;
        });
      } else {
        csvContent += `"${dateStr}","${exerciseName}",0,0,0,"${notes}"\n`;
      }
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MeetFit_Workout_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Failed to export CSV', err);
    alert('Failed to generate CSV export. Please try again.');
  }
};

/**
 * Generate and print/download formatted PDF Progression Summary Report
 */
export const exportWorkoutPDF = async (userName = 'Athlete', unit = 'kg') => {
  try {
    const res = await api.get('/sessions?limit=1000');
    const sessions = res.data;

    const heatmapRes = await api.get('/stats/streak-heatmap');
    const streakData = heatmapRes.data || { currentStreak: 0, longestStreak: 0, totalWorkouts: 0 };

    // Calculate overall stats
    let totalVolume = 0;
    let totalSets = 0;
    const exercisePRs = {};

    sessions.forEach((s) => {
      const exName = s.exerciseId?.name || 'Exercise';
      if (s.sets) {
        s.sets.forEach((set) => {
          totalSets++;
          const vol = (set.weight || 0) * (set.reps || 0);
          totalVolume += vol;
          if (!exercisePRs[exName] || set.weight > exercisePRs[exName]) {
            exercisePRs[exName] = set.weight;
          }
        });
      }
    });

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocker prevented opening report window. Please allow pop-ups!');
      return;
    }

    const reportHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>MeetFit Progression Summary - ${userName}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0A0A0F; color: #F0F0F5; padding: 100px 40px 40px 40px; }
            .header { border-bottom: 2px solid #00E5FF; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .logo { font-size: 28px; font-weight: bold; color: #fff; letter-spacing: 2px; }
            .logo span { color: #00E5FF; }
            .title { font-size: 20px; color: #94A3B8; margin-top: 5px; }
            .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
            .card { background: #111118; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; text-align: center; }
            .card-val { font-size: 24px; font-weight: bold; color: #00E5FF; margin-top: 5px; }
            .card-lbl { font-size: 12px; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.1); }
            th { background: #181824; color: #00E5FF; font-size: 12px; text-transform: uppercase; }
            tr:nth-child(even) { background: rgba(255,255,255,0.02); }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #64748B; }
            .no-print {
              background: #111118;
              border-bottom: 1px solid rgba(255,255,255,0.1);
              padding: 15px 40px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              z-index: 1000;
            }
            .no-print-btn {
              background: linear-gradient(135deg, #00E5FF 0%, #0088FF 100%);
              border: none;
              color: #0A0A0F;
              padding: 8px 16px;
              border-radius: 8px;
              font-weight: bold;
              cursor: pointer;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              transition: all 0.2s;
            }
            .no-print-btn:hover {
              opacity: 0.9;
              transform: translateY(-1px);
            }
            .no-print-btn-secondary {
              background: rgba(255,255,255,0.05);
              border: 1px solid rgba(255,255,255,0.1);
              color: #fff;
              padding: 8px 16px;
              border-radius: 8px;
              font-weight: bold;
              cursor: pointer;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              transition: all 0.2s;
            }
            .no-print-btn-secondary:hover {
              background: rgba(255,255,255,0.1);
            }
            @media print {
              .no-print { display: none !important; }
              body { background: #fff; color: #000; padding: 20px; }
              .card { border: 1px solid #ccc; background: #f8fafc; }
              .card-val { color: #0284c7; }
              th { background: #e2e8f0; color: #0f172a; }
              td, th { border-bottom: 1px solid #cbd5e1; }
            }
          </style>
        </head>
        <body>
          <div class="no-print">
            <div style="font-size: 14px; color: #94A3B8; font-weight: 500; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
              ⚡ MeetFit Pre-print Preview — Click Print and select "Save as PDF" to save.
            </div>
            <div style="display: flex; gap: 10px;">
              <button onclick="window.print()" class="no-print-btn">
                Print / Save PDF
              </button>
              <button onclick="window.close()" class="no-print-btn-secondary">
                Close Preview
              </button>
            </div>
          </div>
          <div class="header">
            <div>
              <div class="logo">MEET<span>FIT</span></div>
              <div class="title">ATHLETE PROGRESSION REPORT</div>
            </div>
            <div style="text-align: right; font-size: 14px; color: #94A3B8;">
              <div><strong>Athlete:</strong> ${userName}</div>
              <div><strong>Generated:</strong> ${new Date().toLocaleDateString()}</div>
            </div>
          </div>

          <div class="grid">
            <div class="card">
              <div class="card-lbl">Current Streak</div>
              <div class="card-val">${streakData.currentStreak} Days 🔥</div>
            </div>
            <div class="card">
              <div class="card-lbl">Total Workouts</div>
              <div class="card-val">${streakData.totalWorkouts}</div>
            </div>
            <div class="card">
              <div class="card-lbl">Total Volume</div>
              <div class="card-val">${totalVolume.toLocaleString()} ${unit}</div>
            </div>
            <div class="card">
              <div class="card-lbl">Total Sets Logged</div>
              <div class="card-val">${totalSets}</div>
            </div>
          </div>

          <h3 style="color: #fff; border-left: 4px solid #00E5FF; padding-left: 10px; margin-top: 30px;">PERSONAL RECORDS (PRs) SUMMARY</h3>
          <table>
            <thead>
              <tr>
                <th>Exercise Name</th>
                <th>Heavy Load Record (${unit})</th>
              </tr>
            </thead>
            <tbody>
              ${
                Object.keys(exercisePRs).length > 0
                  ? Object.entries(exercisePRs)
                      .map(
                        ([name, weight]) => `
                <tr>
                  <td><strong>${name}</strong></td>
                  <td style="color: #00E5FF; font-weight: bold;">${weight} ${unit}</td>
                </tr>
              `
                      )
                      .join('')
                  : '<tr><td colspan="2">No exercise records available yet.</td></tr>'
              }
            </tbody>
          </table>

          <div class="footer">
            Generated automatically by MeetFit Hypertrophy & Progression Engine.
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(reportHtml);
    printWindow.document.close();
  } catch (err) {
    console.error('Failed to export PDF', err);
    alert('Failed to generate PDF report. Please try again.');
  }
};

/**
 * Generate and print a highly customized PDF Progression Report including selected muscle groups and exercise charts
 */
export const exportCustomPDF = async (
  userName = 'Athlete',
  unit = 'kg',
  dateRange = 'all',
  selectedMuscleGroups = [], // Array of muscle group IDs
  selectedExercises = [], // Array of exercise IDs
  sessions = [],
  muscleGroups = [] // Array of all muscle groups
) => {
  try {
    const now = new Date();
    let dateLimit = null;
    let rangeLabel = 'All Time';

    if (dateRange === '7d') {
      dateLimit = new Date();
      dateLimit.setDate(now.getDate() - 7);
      rangeLabel = 'Last 7 Days';
    } else if (dateRange === '30d') {
      dateLimit = new Date();
      dateLimit.setDate(now.getDate() - 30);
      rangeLabel = 'Last 30 Days';
    } else if (dateRange === '90d') {
      dateLimit = new Date();
      dateLimit.setDate(now.getDate() - 90);
      rangeLabel = 'Last 90 Days';
    } else if (dateRange === '365d') {
      dateLimit = new Date();
      dateLimit.setDate(now.getDate() - 365);
      rangeLabel = 'Last Year';
    }

    const filteredSessions = sessions.filter((s) => {
      const sessionDate = new Date(s.date);
      return !dateLimit || sessionDate >= dateLimit;
    });

    // Calculate Summary Stats
    let totalVolume = 0;
    let totalSets = 0;
    filteredSessions.forEach((s) => {
      if (s.sets) {
        s.sets.forEach((set) => {
          totalSets++;
          totalVolume += (set.weight || 0) * (set.reps || 0);
        });
      }
    });

    // Prepare Chart Data
    const chartConfigData = {
      muscleGroups: {},
      exercises: {},
    };

    // 1. Process Muscle Group Volume
    selectedMuscleGroups.forEach((mgId) => {
      const mgSessions = filteredSessions
        .filter((s) => s.exerciseId?.muscleGroupId === mgId)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      const dateVolumeMap = {};
      mgSessions.forEach((s) => {
        const dateStr = new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        let vol = 0;
        if (s.sets) {
          s.sets.forEach((set) => {
            vol += (set.weight || 0) * (set.reps || 0);
          });
        }
        dateVolumeMap[dateStr] = (dateVolumeMap[dateStr] || 0) + vol;
      });

      chartConfigData.muscleGroups[mgId] = {
        labels: Object.keys(dateVolumeMap),
        data: Object.values(dateVolumeMap),
        name: muscleGroups.find((g) => g._id === mgId)?.name || 'Muscle Group',
      };
    });

    // 2. Process Exercise Progression (Max Weight and e1RM)
    selectedExercises.forEach((exId) => {
      const exSessions = filteredSessions
        .filter((s) => {
          const sExId = s.exerciseId?._id || s.exerciseId;
          return sExId === exId;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      const labels = [];
      const weightData = [];
      const e1rmData = [];

      exSessions.forEach((s) => {
        const dateStr = new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        let maxWeight = 0;
        let maxE1RM = 0;
        if (s.sets) {
          s.sets.forEach((set) => {
            if (set.weight > maxWeight) maxWeight = set.weight;
            const e1rm = set.weight * (1 + set.reps / 30);
            if (e1rm > maxE1RM) maxE1RM = Math.round(e1rm * 10) / 10;
          });
        }
        labels.push(dateStr);
        weightData.push(maxWeight);
        e1rmData.push(maxE1RM);
      });

      // Find exercise name
      let exerciseName = 'Exercise';
      const sampleSession = sessions.find((s) => (s.exerciseId?._id || s.exerciseId) === exId);
      if (sampleSession?.exerciseId?.name) {
        exerciseName = sampleSession.exerciseId.name;
      }

      chartConfigData.exercises[exId] = {
        labels,
        weightData,
        e1rmData,
        name: exerciseName,
      };
    });

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocker prevented opening report window. Please allow pop-ups!');
      return;
    }

    // Generate Dynamic PDF HTML
    let reportHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>MeetFit Custom Progression Report - ${userName}</title>
          <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0A0A0F; color: #F0F0F5; padding: 100px 40px 40px 40px; }
            .header { border-bottom: 2px solid #00E5FF; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .logo { font-size: 28px; font-weight: bold; color: #fff; letter-spacing: 2px; }
            .logo span { color: #00E5FF; }
            .title { font-size: 20px; color: #94A3B8; margin-top: 5px; }
            .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px; }
            .card { background: #111118; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; text-align: center; }
            .card-val { font-size: 24px; font-weight: bold; color: #00E5FF; margin-top: 5px; }
            .card-lbl { font-size: 12px; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; }
            
            .section-title { font-size: 22px; color: #fff; border-left: 4px solid #00E5FF; padding-left: 12px; margin-top: 40px; margin-bottom: 20px; text-transform: uppercase; }
            .chart-wrapper { background: #111118; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 20px; margin-bottom: 30px; max-width: 800px; }
            .chart-container { position: relative; width: 100%; height: 300px; }
            
            .page-break { page-break-after: always; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px; }
            
            .no-print {
              background: #111118;
              border-bottom: 1px solid rgba(255,255,255,0.1);
              padding: 15px 40px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              z-index: 1000;
            }
            .no-print-btn {
              background: linear-gradient(135deg, #00E5FF 0%, #0088FF 100%);
              border: none;
              color: #0A0A0F;
              padding: 8px 16px;
              border-radius: 8px;
              font-weight: bold;
              cursor: pointer;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              transition: all 0.2s;
            }
            .no-print-btn:hover {
              opacity: 0.9;
              transform: translateY(-1px);
            }
            .no-print-btn-secondary {
              background: rgba(255,255,255,0.05);
              border: 1px solid rgba(255,255,255,0.1);
              color: #fff;
              padding: 8px 16px;
              border-radius: 8px;
              font-weight: bold;
              cursor: pointer;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              transition: all 0.2s;
            }
            .no-print-btn-secondary:hover {
              background: rgba(255,255,255,0.1);
            }
            @media print {
              .no-print { display: none !important; }
              body { background: #fff; color: #000; padding: 20px; }
              .card { border: 1px solid #ccc; background: #f8fafc; }
              .card-val { color: #0284c7; }
              .chart-wrapper { border: 1px solid #ddd; background: #fff; }
              .section-title { color: #000; border-left-color: #0284c7; }
            }
          </style>
        </head>
        <body>
          <div class="no-print">
            <div style="font-size: 14px; color: #94A3B8; font-weight: 500; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
              ⚡ MeetFit Pre-print Preview — Click Print and select "Save as PDF" to save.
            </div>
            <div style="display: flex; gap: 10px;">
              <button onclick="window.print()" class="no-print-btn">
                Print / Save PDF
              </button>
              <button onclick="window.close()" class="no-print-btn-secondary">
                Close Preview
              </button>
            </div>
          </div>
          <div class="header">
            <div>
              <div class="logo">MEET<span>FIT</span></div>
              <div class="title">CUSTOM PROGRESSION REPORT</div>
            </div>
            <div style="text-align: right; font-size: 14px; color: #94A3B8;">
              <div><strong>Athlete:</strong> ${userName}</div>
              <div><strong>Range:</strong> ${rangeLabel}</div>
              <div><strong>Generated:</strong> ${new Date().toLocaleDateString()}</div>
            </div>
          </div>

          <div class="grid">
            <div class="card">
              <div class="card-lbl">Total Workouts in Range</div>
              <div class="card-val">${filteredSessions.length}</div>
            </div>
            <div class="card">
              <div class="card-lbl">Total Volume</div>
              <div class="card-val">${totalVolume.toLocaleString()} ${unit}</div>
            </div>
            <div class="card">
              <div class="card-lbl">Total Sets Logged</div>
              <div class="card-val">${totalSets}</div>
            </div>
          </div>
    `;

    // 1. Render Muscle Group Sections
    selectedMuscleGroups.forEach((mgId) => {
      const mgData = chartConfigData.muscleGroups[mgId];
      if (mgData) {
        reportHtml += `
          <div class="page-break"></div>
          <h3 class="section-title">${mgData.name} - Volume Progression</h3>
          <div class="chart-wrapper">
            <div class="chart-container">
              <canvas id="chart-mg-${mgId}"></canvas>
            </div>
          </div>
        `;
      }
    });

    // 2. Render Exercise Sections
    selectedExercises.forEach((exId) => {
      const exData = chartConfigData.exercises[exId];
      if (exData) {
        const prWeight = exData.weightData.length > 0 ? Math.max(...exData.weightData) : 0;
        const prE1rm = exData.e1rmData.length > 0 ? Math.max(...exData.e1rmData) : 0;

        reportHtml += `
          <div class="page-break"></div>
          <h3 class="section-title">${exData.name} - Strength Progression</h3>
          <div style="display: flex; gap: 20px; margin-bottom: 20px;">
            <div class="card" style="flex: 1; padding: 12px;">
              <div class="card-lbl" style="font-size: 10px;">Personal Record (PR)</div>
              <div class="card-val" style="font-size: 18px;">${prWeight} ${unit}</div>
            </div>
            <div class="card" style="flex: 1; padding: 12px;">
              <div class="card-lbl" style="font-size: 10px;">Est. 1RM Peak</div>
              <div class="card-val" style="font-size: 18px;">${prE1rm} ${unit}</div>
            </div>
          </div>
          <div class="chart-wrapper">
            <div class="chart-container">
              <canvas id="chart-ex-${exId}"></canvas>
            </div>
          </div>
        `;
      }
    });

    reportHtml += `
          <div class="footer">
            Generated automatically by MeetFit Hypertrophy & Progression Engine.
          </div>

          <script>
            const rawChartData = ${JSON.stringify(chartConfigData)};
            
            const gridColor = 'rgba(255, 255, 255, 0.1)';
            const textColor = '#94A3B8';

            window.onload = function() {
              // 1. Render Muscle Group Volume Charts
              Object.keys(rawChartData.muscleGroups).forEach(mgId => {
                const info = rawChartData.muscleGroups[mgId];
                const ctx = document.getElementById('chart-mg-' + mgId).getContext('2d');
                new Chart(ctx, {
                  type: 'bar',
                  data: {
                    labels: info.labels,
                    datasets: [{
                      label: 'Workout Volume (${unit})',
                      data: info.data,
                      backgroundColor: 'rgba(0, 229, 255, 0.4)',
                      borderColor: '#00E5FF',
                      borderWidth: 2,
                      borderRadius: 6
                    }]
                  },
                  options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    plugins: {
                      legend: { labels: { color: textColor } }
                    },
                    scales: {
                      x: { grid: { color: gridColor }, ticks: { color: textColor } },
                      y: { grid: { color: gridColor }, ticks: { color: textColor } }
                    }
                  }
                });
              });

              // 2. Render Exercise Strength Charts
              Object.keys(rawChartData.exercises).forEach(exId => {
                const info = rawChartData.exercises[exId];
                const ctx = document.getElementById('chart-ex-' + exId).getContext('2d');
                new Chart(ctx, {
                  type: 'line',
                  data: {
                    labels: info.labels,
                    datasets: [
                      {
                        label: 'Estimated 1RM (${unit})',
                        data: info.e1rmData,
                        borderColor: '#00E5FF',
                        backgroundColor: 'rgba(0, 229, 255, 0.1)',
                        fill: true,
                        tension: 0.3,
                        borderWidth: 3
                      },
                      {
                        label: 'Max Weight Lifted (${unit})',
                        data: info.weightData,
                        borderColor: '#0088FF',
                        backgroundColor: 'transparent',
                        tension: 0.1,
                        borderDash: [5, 5],
                        borderWidth: 2
                      }
                    ]
                  },
                  options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    plugins: {
                      legend: { labels: { color: textColor } }
                    },
                    scales: {
                      x: { grid: { color: gridColor }, ticks: { color: textColor } },
                      y: { grid: { color: gridColor }, ticks: { color: textColor } }
                    }
                  }
                });
              });

              // Wait slightly for charts to render fully before printing
              setTimeout(() => {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(reportHtml);
    printWindow.document.close();
  } catch (err) {
    console.error('Failed to export custom PDF', err);
    alert('Failed to generate custom PDF report. Please try again.');
  }
};
