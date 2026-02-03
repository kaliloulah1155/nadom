<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">Rapports & Statistiques</h4>
        <p class="text-muted mb-0">Analyse des performances et activités</p>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-primary">
          <i class="bi bi-download me-2"></i>Exporter PDF
        </button>
        <button class="btn btn-primary">
          <i class="bi bi-file-earmark-excel me-2"></i>Exporter Excel
        </button>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="row g-4 mb-4">
      <div class="col-sm-6 col-lg-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <h6 class="text-muted small">Volume d'affaires</h6>
            <h4 class="mb-0">45,670,000 FCFA</h4>
            <small class="text-success"><i class="bi bi-arrow-up me-1"></i>12.5% vs mois dernier</small>
          </div>
        </div>
      </div>
      <div class="col-sm-6 col-lg-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <h6 class="text-muted small">Demandes traitées</h6>
            <h4 class="mb-0">342</h4>
            <small class="text-success"><i class="bi bi-arrow-up me-1"></i>8% vs mois dernier</small>
          </div>
        </div>
      </div>
      <div class="col-sm-6 col-lg-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <h6 class="text-muted small">Nouveaux clients</h6>
            <h4 class="mb-0">48</h4>
            <small class="text-danger"><i class="bi bi-arrow-down me-1"></i>2% vs mois dernier</small>
          </div>
        </div>
      </div>
      <div class="col-sm-6 col-lg-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <h6 class="text-muted small">Taux de satisfaction</h6>
            <h4 class="mb-0">4.7/5</h4>
            <small class="text-success"><i class="bi bi-check-circle me-1"></i>Stable</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed Reports Section -->
    <div class="row g-4">
      <div class="col-lg-8">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-transparent d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Évolution mensuelle</h5>
            <select class="form-select form-select-sm" style="width: 150px;">
              <option>Derniers 12 mois</option>
              <option>Derniers 6 mois</option>
              <option>Cette année</option>
            </select>
          </div>
          <div class="card-body">
            <div id="chart"></div>
          </div>
        </div>
      </div>
      
      <div class="col-lg-4">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-transparent">
            <h5 class="mb-0">Top Destinations</h5>
          </div>
          <div class="card-body">
            <div v-for="(count, city) in topDestinations" :key="city" class="mb-3">
              <div class="d-flex justify-content-between mb-1">
                <small>{{ city }}</small>
                <small class="fw-medium">{{ count }}%</small>
              </div>
              <div class="progress" style="height: 6px;">
                <div class="progress-bar" :style="{ width: count + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

definePageMeta({
  layout: 'admin'
})

const topDestinations = {
  'Abidjan, CI': 45,
  'Dakar, SN': 25,
  'Bamako, ML': 15,
  'Douala, CM': 10,
  'Autres': 5
}

onMounted(() => {
  if (typeof window !== 'undefined' && (window as any).ApexCharts) {
    const options = {
      series: [{
        name: "Volume d'affaires (FCFA)",
        data: [31000, 40000, 28000, 51000, 42000, 109000, 100000, 120000, 110000, 138000, 145000, 160000]
      }],
      chart: {
        height: 350,
        type: 'area',
        toolbar: {
          show: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth',
        colors: ['#c71f37']
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.9,
          stops: [0, 90, 100],
          colorStops: [
            {
              offset: 0,
              color: "#c71f37",
              opacity: 0.2
            },
            {
              offset: 100,
              color: "#c71f37",
              opacity: 0
            }
          ]
        }
      },
      xaxis: {
        categories: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"],
      },
      tooltip: {
        x: {
          format: 'dd/MM/yy HH:mm'
        },
      },
    };

    const chart = new (window as any).ApexCharts(document.querySelector("#chart"), options);
    chart.render();
  }
})
</script>
