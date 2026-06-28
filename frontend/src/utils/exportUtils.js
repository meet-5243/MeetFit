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
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0A0A0F; color: #F0F0F5; padding: 40px; }
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
            @media print {
              body { background: #fff; color: #000; padding: 20px; }
              .card { border: 1px solid #ccc; background: #f8fafc; }
              .card-val { color: #0284c7; }
              th { background: #e2e8f0; color: #0f172a; }
              td, th { border-bottom: 1px solid #cbd5e1; }
            }
          </style>
        </head>
        <body>
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
