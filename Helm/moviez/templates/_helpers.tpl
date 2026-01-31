
{{- define "moviez.fullname" -}}
{{ .Release.Name }}-moviez
{{- end }}

{{/*
Common labels
*/}}
{{- define "moviez.labels" -}}
app.kubernetes.io/name: moviez
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "moviez.selectorLabels" -}}
app: moviez
{{- end }}
