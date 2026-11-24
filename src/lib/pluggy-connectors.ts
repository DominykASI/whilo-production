/**
 * Best-effort mapping from Brazilian bank COMPE codes (our catalogue id) to Pluggy connector ids.
 * Generated from GET /api/pluggy/connectors?countries=BR and name/alias matching; entries are only
 * added when the match is confident. When a bank has no mapping we open generic Pluggy Connect and
 * let the person pick the institution inside the widget.
 */
export interface PluggyConnectorMatch {
  connectorId: number;
  connectorName: string;
}

export const PLUGGY_CONNECTOR_BY_COMPE: Readonly<Record<string, PluggyConnectorMatch>> = {
  "001": { "connectorId": 798, "connectorName": "Banco do Brasil" },
  "003": { "connectorId": 731, "connectorName": "Banco da Amazônia" },
  "004": { "connectorId": 692, "connectorName": "Banco do Nordeste" },
  "021": { "connectorId": 849, "connectorName": "Banestes" },
  "033": { "connectorId": 212, "connectorName": "Banco Santander" },
  "041": { "connectorId": 861, "connectorName": "Banrisul" },
  "047": { "connectorId": 829, "connectorName": "Banese" },
  "070": { "connectorId": 854, "connectorName": "BRB - Banco de Brasília" },
  "077": { "connectorId": 216, "connectorName": "Banco Inter" },
  "084": { "connectorId": 618, "connectorName": "Uniprime" },
  "085": { "connectorId": 807, "connectorName": "Ailos" },
  "102": { "connectorId": 602, "connectorName": "XP Banking" },
  "104": { "connectorId": 214, "connectorName": "Caixa" },
  "121": { "connectorId": 777, "connectorName": "Agibank" },
  "125": { "connectorId": 765, "connectorName": "Genial" },
  "133": { "connectorId": 806, "connectorName": "Cresol" },
  "136": { "connectorId": 670, "connectorName": "Unicred Empresas" },
  "184": { "connectorId": 601, "connectorName": "Itaú" },
  "197": { "connectorId": 787, "connectorName": "Stone Pagamentos" },
  "208": { "connectorId": 675, "connectorName": "BTGPactual" },
  "212": { "connectorId": 202, "connectorName": "Banco Original" },
  "218": { "connectorId": 805, "connectorName": "BS2" },
  "237": { "connectorId": 201, "connectorName": "Bradesco" },
  "246": { "connectorId": 838, "connectorName": "Banco ABC Brasil" },
  "260": { "connectorId": 612, "connectorName": "Nubank" },
  "274": { "connectorId": 804, "connectorName": "Money Plus" },
  "280": { "connectorId": 679, "connectorName": "Will Bank" },
  "290": { "connectorId": 692, "connectorName": "PagBank" },
  "301": { "connectorId": 836, "connectorName": "Dock" },
  "318": { "connectorId": 652, "connectorName": "Banco Bmg" },
  "323": { "connectorId": 206, "connectorName": "Mercado Pago" },
  "332": { "connectorId": 789, "connectorName": "Acesso" },
  "335": { "connectorId": 687, "connectorName": "Digio" },
  "336": { "connectorId": 626, "connectorName": "C6 Bank" },
  "341": { "connectorId": 601, "connectorName": "Itaú" },
  "364": { "connectorId": 881, "connectorName": "Efí" },
  "376": { "connectorId": 863, "connectorName": "JP Morgan" },
  "380": { "connectorId": 614, "connectorName": "PicPay" },
  "389": { "connectorId": 625, "connectorName": "Mercantil do Brasil" },
  "403": { "connectorId": 808, "connectorName": "Cora" },
  "422": { "connectorId": 672, "connectorName": "Banco Safra" },
  "450": { "connectorId": 827, "connectorName": "FitBank" },
  "623": { "connectorId": 853, "connectorName": "Banco PAN" },
  "633": { "connectorId": 676, "connectorName": "Banco Rendimento" },
  "637": { "connectorId": 686, "connectorName": "Sofisa Direto" },
  "655": { "connectorId": 844, "connectorName": "Banco Votorantim" },
  "707": { "connectorId": 791, "connectorName": "Banco Daycoval" },
  "735": { "connectorId": 689, "connectorName": "Neon" },
  "745": { "connectorId": 864, "connectorName": "Citibank" },
  "746": { "connectorId": 678, "connectorName": "Modal" },
  "748": { "connectorId": 615, "connectorName": "Sicredi" },
  "756": { "connectorId": 617, "connectorName": "Sicoob" },
};

export function pluggyConnectorForCompe(compe: string): PluggyConnectorMatch | null {
  return PLUGGY_CONNECTOR_BY_COMPE[compe] ?? null;
}
