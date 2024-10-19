let campaignData = []
let selectedSegmentacao = ''
let chartInstance


document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0]

    if (file) {
        Papa.parse(file, {
            header: true,
            complete: function(results) {
                campaignData = results.data
                populateDropdown(campaignData)
                displayTable(campaignData) // Exibir todos os dados inicialmente
                
                // Mostrar os botões após o upload
                document.getElementById('buttonContainer').style.display = 'flex'
            },
            error: function(error) {
                console.error("Erro ao ler o arquivo CSV: ", error)
            }
        })
    }
})

function populateDropdown(data) {
    const dropdown = document.getElementById('segmentacaoDropdown')
    const segmentacoes = [...new Set(data.map(row => row.Segmentacao))]

    segmentacoes.forEach(segmentacao => {
        const option = document.createElement('option')
        option.value = segmentacao
        option.textContent = segmentacao
        dropdown.appendChild(option)
    })

    dropdown.addEventListener('change', function() {
        selectedSegmentacao = this.value // Armazena a segmentação selecionada
        const filteredData = selectedSegmentacao ? data.filter(row => row.Segmentacao === selectedSegmentacao) : data
        displayTable(filteredData)
    })
}

function displayTable(data) {
    const tableContainer = document.getElementById('tableContainer')
    tableContainer.innerHTML = ''

    if (data.length === 0) {
        tableContainer.innerHTML = '<p>Nenhum dado para exibir.</p>'
        return
    }

    const table = document.createElement('table')
    const headerRow = document.createElement('tr')

    // Cria cabeçalho da tabela
    Object.keys(data[0]).forEach(key => {
        const th = document.createElement('th')
        th.textContent = key
        th.style.cursor = 'pointer'
        th.addEventListener('click', function() {
            console.log('Cabeçalho clicado:', key)
            openPopup(key)
        })
        headerRow.appendChild(th)
    })
    table.appendChild(headerRow)

    // Adiciona dados à tabela
    data.forEach(row => {
        const tr = document.createElement('tr')
        Object.values(row).forEach(value => {
            const td = document.createElement('td')
            td.textContent = value
            tr.appendChild(td)
        })
        table.appendChild(tr)
    })

    tableContainer.appendChild(table)
}

function openPopup(header) {
    const popup = document.getElementById('popup')
    const ctx = document.getElementById('chartCanvas').getContext('2d')

    // Filtrar os dados com base na segmentação selecionada
    const filteredData = campaignData.filter(row => row.Segmentacao === selectedSegmentacao)

    const labels = filteredData.map(row => row['Nome da campanha']?.trim() || 'Sem Nome')
    const values = filteredData.map(row => {
        const value = row[header]
        return parseFloat(value.replace(',', '.').replace(/[^0-9.]/g, '')) || 0
    })

    if (chartInstance) {
        chartInstance.destroy()
    }

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels, 
            datasets: [{
                label: header, 
                data: values, 
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, 
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    })

    // Exibir o popup
    popup.style.display = 'flex'
    
    // Adicionar o evento de clique fora do popup
    setTimeout(() => {
        document.addEventListener('click', closePopupOnClickOutside)
    }, 0)
}

function closePopupOnClickOutside(event) {
    const popup = document.getElementById('popup')
    // Verifica se o clique foi fora do popup
    if (popup.style.display === 'flex' && !popup.contains(event.target)) {
        popup.style.display = 'none' // Fecha o popup
        document.removeEventListener('click', closePopupOnClickOutside) // Remove o listener
    }
}