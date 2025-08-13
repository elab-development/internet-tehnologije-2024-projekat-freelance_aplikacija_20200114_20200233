<!DOCTYPE html>
<html lang="sr">
<head>
  <meta charset="UTF-8">
  <title>Zahtevi - PDF</title>
  <style>
    * { font-family: DejaVu Sans, sans-serif; font-size: 12px; }
    h1 { font-size: 18px; margin: 0 0 8px 0; }
    .meta { margin: 0 0 12px 0; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ccc; padding: 6px 8px; }
    th { background: #f5f5f5; text-align: left; }
    .right { text-align: right; }
    .small { color: #666; font-size: 11px; }
  </style>
</head>
<body>
  <h1>Zahtevi</h1>
  <p class="meta">
    Ponuđač: <strong>{{ $seller->name }}</strong><br>
    Period: <strong>{{ $period }}</strong><br>
    Generisano: <span class="small">{{ now()->toDateTimeString() }}</span>
  </p>

  @if($rows->isEmpty())
    <p>Nema podataka za izvoz.</p>
  @else
    <table>
      <thead>
        <tr>
          <th>#ID</th>
          <th>Projekat</th>
          <th>Kupac</th>
          <th>Poruka</th>
          <th class="right">Budžet (€)</th>
          <th class="right">Ponuda (€)</th>
          <th>Status</th>
          <th>Kreirano</th>
        </tr>
      </thead>
      <tbody>
        @foreach($rows as $r)
          <tr>
            <td>{{ $r->id }}</td>
            <td>{{ optional($r->project)->title }}</td>
            <td>{{ optional($r->serviceBuyer)->name }}</td>
            <td>{{ $r->message }}</td>
            <td class="right">{{ number_format((float)optional($r->project)->budget, 2, ',', '.') }}</td>
            <td class="right">{{ number_format((float)$r->price_offer, 2, ',', '.') }}</td>
            <td>{{ $r->status }}</td>
            <td>{{ optional($r->created_at)->toDateTimeString() }}</td>
          </tr>
        @endforeach
      </tbody>
    </table>
  @endif
</body>
</html>
